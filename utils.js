var cp = require('child_process');

const ADMIN_SCRIPT = '/srv/app/run.sh';

/*

  turn strings into arrays or return null
  
*/
function processArrayArg(arr){
  if(typeof(arr)=='string') arr = [arr]
  if(!arr) return null
  return arr.length ? arr : null
}

module.exports = {
  /*
  
    grab a container id from a url like:

      /v1.16/containers/123456/start
    
  */
  extractStartID:function(url){
    var id = url.replace(/^.*?\/containers\//, '');
    id = id.replace(/\/.*$/, '');
    return id;
  },


  /*
  
    extract the WEAVE_CIDR environment variable
    from the JSON response from `docker inspect 1234`
    
  */
  extractWeaveEnv:function(envVars){
    envVars = envVars || []

    var weaveVars = envVars.filter(function(envVar){
      return envVar.indexOf('WEAVE_CIDR=')==0;
    }).map(function(envVar){
      return envVar.split('=')[1];
    })

    return weaveVars[0];
  },

  /*
  
    grab the env array from the results of docker inspect $CONTAINERID
    
  */
  extractEnvFromInspectPacket:function(inspect){
    return inspect.Config.Env
  },

  /*
  
    return a single array representing the command that is a combo of the entry point and command

    the containerEntry and containerCommand ovveride the imageEntry and imageCommand
    
  */
  combineEntryPoints:function(imageEntry, containerEntry, imageCommand, containerCommand){
    var entry = processArrayArg(containerEntry) || processArrayArg(imageEntry) || []
    var command = processArrayArg(containerCommand) || processArrayArg(imageCommand) || []

    return entry.concat(command)
  },

  /*
  
    execute the `weave attach $CIDR $CONTAINER` command
    
  */
  runWeaveAttach:function(weaveCidr, containerID, callback){

    // we are inside the container and so will use /srv/app/run.sh attach $cidr $containerid
    cp.exec(ADMIN_SCRIPT + ' attach ' + weaveCidr + ' ' + containerID, function(err, stdout, stderr){
      if(err) return callback(err);
      if(stderr) return callback(stderr.toString());

      // the network should be attaching itself and the wait-for-weave doing its thing!
      callback();
    })
  }

}
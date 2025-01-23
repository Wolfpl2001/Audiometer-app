const ffmpeg =require('fluent-ffmpeg');
const Q = require('q');
const uuid = require('uuid');

/**
 * TaskTranscodeAudio
 * @description Using ffmpeg to transcode audio
 */
class TaskTranscodeAudio 
{
  inputFile;              // input file with path
  uuidV4 = uuid.v4();     // unique uuid
  outputFile;
  audioFilter;
  
  constructor()
  {
  }

  checkSupportedAudioFile()
  {
    // TODO check if it's realy an audio file?
    // use ffprobe? or look into mime-type
  }

  // Check valid input and output file
  checkValidInputOutput()
  {
    if( !this.inputFile || !this.inputFile.length > 0 || 
        !this.outputFile || !this.outputFile > 0 )
        return new Error("Missing output or input");
    return true;
  }

  transcodeAudioFile()
  {
    const deferred = Q.defer();
    // Check requirements to start transcoding
    if(this.checkValidInputOutput() == Error) return deferred.error("Missing file input or output"); 
    
    // Create an ffmpeg transocder
    const transcoder = ffmpeg(this.inputFile);

    // Set an audiofilter
    if (this.audioFilter) {
      transcoder.audioFilter(this.audioFilter);
    }
    // TODO other stuff like:
    // transcoder.audioQuality
    // transcoder.audioCodec
    // transcoder.audioFrequency
    
    // Transcoder events
    transcoder.on('start', (commandLine) => {
      console.info('task.transcode.audio.js -- transcodeAudioFile -- start command:', commandLine);
    });
    transcoder.on('stderr', (stderrLine) => {
        console.info('task.transcode.audio.js  -- transcodeAudioFile -- stderr: ', stderrLine);
    })
    transcoder.on('error', (err) => {
        log.error('task.transcode.audio.js -- transcodeAudioFile --' +
                  ' error: ' + err.message);
        return deferred.reject(err);
    });
    transcoder.on('end', () => {
        // TODO
        return deferred.resolve(this.outputFile);
    });
    transcoder.save(this.outputFile);

    return deferred.promise;
  }
}

module.exports.TaskTranscodeAudio =  TaskTranscodeAudio;
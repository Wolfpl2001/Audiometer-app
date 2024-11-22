import * as ffmpeg from 'fluent-ffmpeg';
import * as Q from 'q';
import * as uuid from 'uuid';
import * as path from 'path';
import * as fs from 'fs';

export class TaskTranscodeAudio 
{
  inputPath;
  inputFile;
  uuidV4 = uuid.v4();
  outputPath;
  outputFile:
  
  constructor()
  {
  }

  // Set input
  setInput(inputPath, inputFile)
  {
    this.inputPath = inputPath;
    this.inputFile = inputFile;
  }

  // Set output
  setOutput(outputPath, outputFile)
  {
    this.outputFile = outputFile;
    this.outputPath = outputPath;
  }

  checkSupportedAudioFile()
  {
    // TODO check if it's realy a 
  }

  // Check valid input and output file
  checkValidInputOutput()
  {
    if( !this.inputFile || !this.inputFile.length > 0 || 
        !this.inputPath || !this.inputPath > 0 ||
        !this.outputFile || !this.outputFile > 0 || 
        !this.outputPath || !this.outputPath > 0)
        return new Error("Missing output or input);
    return true;
  }

  transcodeAudioFile()
  {
    const deferred = Q.defer();
    checkValidInputOutput(); 
    const transcoder = ffmpet(this.inputPath + this.inputFile);
    
    // Transcoder events
    transcoder.on('start', (commandLine) => {
      console.info('task.transcode.audio.js -- transcodeAudioFile -- start command:', commandLine);
    });
    
    transcoder.on('stderr', (stderrLine) => {
        console.error('task.transcode.audio.js  -- transcodeAudioFile -- stderr: ', stderrLine);
    })
    transcoder.on('error', (err) => {
        log.error('task.transcode.audio.js -- transcodeAudioFile --' +
                  ' error: ' + err.message);
        return deferred.reject(err);
    });
    transcoder.on('end', () => {
        return deferred.resolve();
    });

    transcoder.save(this.outputPath + this.outputFile);

    return deferred.promise;
  }
}

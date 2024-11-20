import {app, dialog, ipcMain} from "electron";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import fs from "fs";

let tempOutputPath = null;

function saveOutputPath() {
    ipcMain.handle('saveOutputFilePath', async (event, { outputPath }) => {
        try {
            saveOutputPath = outputPath;
            console.log('Saving Test:', tempOutputPath);
            return { success: true, outputPath: tempOutputPath };
        } catch (error) {
            console.error('Error saving TEst spath:', error);
            return { success: false, error: error.message };
        }
    });
}
ipcMain.handle('file:save', async (event, filePath) => {
    const outputFilePath = path.join(app.getPath('temp'), 'output.wav');
    return new Promise((resolve, reject) => {
        ffmpeg(filePath)
            .setFfmpegPath(ffmpegStatic)
            .audioFilters([
                'volume=-12dB',
                'channelsplit=channel_layout=stereo[left][right]',
                '[left]equalizer=f=125:width_type=h:width=200:g=0.0[a]',
                '[right]equalizer=f=125:width_type=h:width=200:g=5.0[b]',
                '[a]equalizer=f=250:width_type=h:width=200:g=5.0[a]',
                '[b]equalizer=f=250:width_type=h:width=200:g=0.0[b]',
                '[a]equalizer=f=500:width_type=h:width=200:g=0.0[a]',
                '[b]equalizer=f=500:width_type=h:width=200:g=-5.0[b]',
                '[a]equalizer=f=750:width_type=h:width=200:g=0.0[a]',
                '[b]equalizer=f=750:width_type=h:width=200:g=5.0[b]',
                '[a]equalizer=f=1000:width_type=h:width=200:g=15.0[a]',
                '[b]equalizer=f=1000:width_type=h:width=200:g=15.0[b]',
                '[a]equalizer=f=1500:width_type=h:width=200:g=10.0[a]',
                '[b]equalizer=f=1500:width_type=h:width=200:g=15.0[b]',
                '[a]equalizer=f=2000:width_type=h:width=200:g=10.0[a]',
                '[b]equalizer=f=2000:width_type=h:width=200:g=15.0[b]',
                '[a]equalizer=f=3000:width_type=h:width=200:g=10.0[a]',
                '[b]equalizer=f=3000:width_type=h:width=200:g=10.0[b]',
                '[a]equalizer=f=4000:width_type=h:width=200:g=10.0[a]',
                '[b]equalizer=f=4000:width_type=h:width=200:g=10.0[b]',
                '[a]equalizer=f=6000:width_type=h:width=200:g=15.0[a]',
                '[b]equalizer=f=6000:width_type=h:width=200:g=15.0[b]',
                '[a]equalizer=f=8000:width_type=h:width=200:g=20.0[a]',
                '[b]equalizer=f=8000:width_type=h:width=200:g=15.0[b]',
                '[a][b]join=inputs=2:channel_layout=stereo',
                'dynaudnorm',
                'volume=-6dB'
            ])
            .on('end', () => {
                console.log('Processing finished!');
                resolve(outputFilePath);
            })
            .on('error', (err) => {
                console.error('Error during processing:', err);
                reject(err);
            })
            .save(outputFilePath);
    });
})

//return the functions
module.exports = {
    saveOutputPath,
};

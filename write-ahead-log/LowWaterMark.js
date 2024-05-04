import fs from 'node:fs';
import {open} from 'node:fs/promises';
import path from 'path';

class LogCleaner {

    constructor(logDirPath, logMaxDurationMs){
        this.logMaxDurationMs = logMaxDurationMs;
        this.logDirPath = logDirPath;
    }

    cleanLogs(resetIndex, openSegment){
        let segmentsToBeDeleted = this.getSortedSegments();
        const directory = this.logDirPath;
        
        for(const Segment of segmentsToBeDeleted){

            const filePath = path.join(directory,Segment);

            if(filePath === openSegment){
                break;
            }
            this.removeAndDeleteSegment(filePath);
        }
        if(resetIndex === true){
            this.reorderOpenSegments();
        }
    }


    removeAndDeleteSegment(filePath){
        fs.unlinkSync(filePath);
        console.log(filePath);
    } 


    getSortedSegments(){
        const directory = this.logDirPath;
        const files = fs.readdirSync(directory);

        const prefixFiles = files.filter(file => file.startsWith('wal_') && file.endsWith('.log'));

        prefixFiles.sort((a, b) => {
            const indexA = parseInt(a.split('_')[1].split('.')[0]);
            const indexB = parseInt(b.split('_')[1].split('.')[0]);
            return indexA - indexB;
        });
        return prefixFiles;
    }

    reorderOpenSegments(){
        const files = this.getSortedSegments();
        
        const directory = this.logDirPath;

        let newIndex = 0;
        for(const Segment of files){

            //console.log(Segment); 

            const filePath = path.join(directory, Segment);
            const newFileName = `wal_${newIndex}.log`;
            const newFilePath = path.join(directory, newFileName);

            const logContent = fs.readFileSync(filePath,'utf8');
            const logRows = logContent.split('\n');

            let newLogRows = [];
            for(const row of logRows){
                if(row.trim()!==''){
                    const parts = row.split(';');
                    parts[0] = newIndex;
                    newIndex++;
                    const newRow = parts.join(';')
                    newLogRows.push(newRow);
                }
            }
            let newLogContent = newLogRows.join('\n');
            newLogContent+='\n'; 
            fs.writeFileSync(newFilePath, newLogContent, 'utf8');
            fs.unlinkSync(filePath);
        }
    }


}
export default LogCleaner;


    /*
        //Time-Based Low-Water Mark (not done)

    startup(){
        scheduleLogCleaning();
    }

    scheduleLogCleaning(){
        //add schedule time executor

        cleanLogs();
    }


    getSegmentsPast(){
        const now = Data.now();
        let markedForDeletion = [];
        const sortedSavedSegments = sortedSavedSegments();;
        for(const Segment of sortedSavedSegments){
            const lastTimeStamp = getLastLogEntryTimestamp(Segment);
            if(timeElaspedSince(now, lastTimeStamp) > this.logMaxDurationMs){
                markedForDeletion.add(Segment);
            }
        }
        return markedForDeletion;
    }

    timeElaspedSince(now, lastLogEntryTimestamp){
        return (now-lastLogEntryTimestamp);
    }
    getLastLogEntryTimestamp(Segment){

    }
    */

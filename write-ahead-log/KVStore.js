import WriteAheadLog from './WriteAheadLog.js';
import LogCleaner from './LowWaterMark.js';
import fs from 'node:fs'
import path from 'path'

class KVStore {

    constructor(logDirPath,rotateSize, logMaxDurationMs){
        this.kv = new Map();
        this.logPath = this.getLatestLogFile(logDirPath);
        this.wal = new WriteAheadLog(this.logPath,rotateSize);
        this.LowWaterMark = new LogCleaner(logDirPath,logMaxDurationMs);
        this.rotateSize = rotateSize;
        this.wal.maybeRotate();
        this.restoreFromLog();
    }

    getSortedSegments(directory){

        const files = fs.readdirSync(directory);

        const prefixFiles = files.filter(file => file.startsWith('wal_') && file.endsWith('.log'));

        prefixFiles.sort((a, b) => {
            const indexA = parseInt(a.split('_')[1].split('.')[0]);
            const indexB = parseInt(b.split('_')[1].split('.')[0]);
            return indexA - indexB;
        });
        return prefixFiles;
    }

    getLatestLogFile(dirname) {

        const files = fs.readdirSync(dirname);

        const prefixFiles = files.filter(file => file.startsWith('wal_') && file.endsWith('.log'));

        if (prefixFiles.length === 0){
            const newLogFile = path.join(dirname, `wal_0.log`);
            fs.writeFileSync(newLogFile, ''); // Create an empty log file
            return newLogFile; // Return the path of the newly created log file
        }

        prefixFiles.sort((a, b) => {
            const indexA = parseInt(a.split('_')[1].split('.')[0]);
            const indexB = parseInt(b.split('_')[1].split('.')[0]);
            return indexB - indexA;
        });

        return path.join(dirname, prefixFiles[0]);
    }

    //used in getLogData()
    searchLogFile(fileIndex){
        const filePath = this.wal.searchLogFile(fileIndex);
        if(filePath === -1){
            return -1; 
        }
        else
            return filePath;
    }
    //used in getLogData()
    searchLogData(filePath, dataIndex){
        const data = this.wal.searchLogData(filePath, dataIndex);
        if(data === -1){
            return -1;
        }
        else
            return data;
    }

    getLogData(dataIndex){
        let index = Math.floor(dataIndex/this.rotateSize);
        const fileIndex = index*this.rotateSize;
        const filePath = this.searchLogFile(fileIndex);
        if(filePath === -1){
            console.log("Can't find the log file.")
            return -1;
        }
        const data = this.searchLogData(filePath, dataIndex);
        if(data === -1){
            console.log("Can't find the data index.");
            return -1;
        }
        return data;
    }

    restoreFromLog(){
        const directory = this.getLogDirPath();
        const sortedSegments = this.getSortedSegments(directory);

        for(const segment of sortedSegments){

            const file = path.join(directory,segment);
            const logContent = this.wal.getLogContent(file);

            const logRows = logContent.split('\n');
            for (const row of logRows) {
                if (row.trim() !== '') {
                    const [index, timestamp, data] = row.split(';');

                    if (data.startsWith('[')) {
                        const map = new Map(JSON.parse(data));
                        for (const [key, value] of map.entries()) {
                            this.kv.set(key, value);                        
                        }
                    } else {
                        const { key, value } = JSON.parse(data);
                        this.kv.set(key, value);
                    }
                }
            }
        }
    }
    getLogDirPath(){
        return path.dirname(this.logPath);
    }

    cleanLog(resetIndex){
        const openSegment = this.logPath;
        this.storeCurrentMap();
        this.LowWaterMark.cleanLogs(resetIndex, openSegment);
        //this.restoreFromSnapshot();

    }
    storeCurrentMap(){
        for(const [key, value] of this.kv){
            this.put(key, value);
        }
    }

    restoreFromSnapshot(){
        this.logPath = this.getLatestLogFile(this.getLogDirPath());

        console.log("restoreFromSnapshot", this.logPath);
        this.wal.logPath = this.logPath;
    }
    getMap() {
        return this.kv
    }

    get(key) {
        return this.kv.get(key);
    }

    put(key, value) {
        this.wal.writeEntry(key, value);
        this.kv.set(key, value);
        this.wal.maybeRotate();
    }

    putBatch(map) {
        this.wal.writeBatch(map.entries());

        for (const [key, value] of map.entries()) {
            this.kv.set(key, value);
        }
        this.wal.maybeRotate();
    }
    putBatch_CrashTest(map){
        this.wal.writeBatch(map.entries());
        for(const [key, value] of map.entries()){
            this.kv.set(key, value);
            console.log("current data:");
            this.kv.forEach((value,key)=>{
                console.log(key,value);
            });
            process.exit(1);
        }
        this.wal.maybeRotate();
    }

    /*
    TakeSnapShot(){
        const snapShotTakenAtLogIndex = this.getLatestLogFile(this.getLogDirPath());
        return snapShotTakenAtLogIndex; 
    }
    */
}

export default KVStore;


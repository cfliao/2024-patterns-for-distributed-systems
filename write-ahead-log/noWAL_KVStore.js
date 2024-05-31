import LogCleaner from './LowWaterMark.js';
import fs from 'node:fs'
import path from 'path'
import { parse, stringify } from 'csv/sync';

class KVStore {

    constructor(logDirPath,rotateSize, logMaxDurationMs, DBPath){
        this.kv = new Map();
        this.logPath = this.getLatestLogFile(logDirPath);
        this.DBPath = DBPath;
        this.LowWaterMark = new LogCleaner(logDirPath,logMaxDurationMs);
        this.rotateSize = rotateSize;
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

    getMap() {
        return this.kv
    }

    get(key) {
        return this.kv.get(key);
    }

    initializeCSV() {                
        const headers = 'key,value\n';
        fs.writeFileSync(this.DBPath, headers);
        console.log('CSV file initialized with headers.');
    }

    updateDB(key, value) {
        if(!fs.existsSync(this.DBPath)){
            this.initializeCSV();
        }
        let data = this.readCSV();
        let keyExists = false;

        // Update value if key exists
        data = data.map(row => {
            if (row.key === key) {
                row.value = value;
                keyExists = true;
            }
            return row;
        });

        // If key doesn't exist, add a new entry
        if (!keyExists) {
            data.push({ key, value });
        }

        this.writeCSV(data);
        console.log('CSV file updated successfully.');
    }
    readCSV() {
        const fileContent = fs.readFileSync(this.DBPath, 'utf-8');
        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true
        });
        return records;
    }

    writeCSV(data) {
        const csvContent = stringify(data, {
            header: true,
            columns: [
                { key: 'key', header: 'key' },
                { key: 'value', header: 'value' }
            ]
        });
        fs.writeFileSync(this.DBPath, csvContent);
    }

    put(key, value) {
        this.kv.set(key, value);
        this.updateDB(key, value);
    }

    putBatch(map) {

        for (const [key, value] of map.entries()) {
            this.kv.set(key, value);
            this.updateDB(key, value);
        }
    }
    put_CrashTest(key, value) {
        this.kv.set(key, value);
        process.kill(process.pid, 'SIGTERM');
        
        this.updateDB(key, value);
    }
    putBatch_CrashTest(map){
        for(const [key, value] of map.entries()){
            this.kv.set(key, value);
            this.updateDB(key, value);
            process.kill(process.pid, 'SIGTERM');
        }

    }

    /*
    TakeSnapShot(){
        const snapShotTakenAtLogIndex = this.getLatestLogFile(this.getLogDirPath());
        return snapShotTakenAtLogIndex; 
    }
    */
}

export default KVStore;


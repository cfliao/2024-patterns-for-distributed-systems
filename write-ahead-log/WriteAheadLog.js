import fs from 'node:fs';
import path from 'path';


class WriteAheadLog {
    logPrefix;
    logSuffix;
    constructor(logPath,rotateSize){
        this.logPath = logPath;
        this.rotateSize = rotateSize;
        this.logSuffix = '.log';
        this.logPrefix = 'wal';
    }

    writeBatch(entries) {// write single entry for the entire batch

        const index = this.getNewestDataIndex() + 1;
        const timestamp = new Date().toISOString();
        const logEntry = { index, timestamp, data: [...entries] };
        const logRow = `${index};${timestamp};${JSON.stringify(logEntry.data)}\n`;
        //const map = new Map(JSON.parse(JSON.stringify(logEntry.data)))
        //console.log(map instanceof Map); 
        fs.appendFileSync(this.logPath, logRow, 'utf8');
    }

    writeEntry(key, value) {
        const index = this.getNewestDataIndex() + 1;
        const timestamp = new Date().toISOString();
        const logEntry = { index, timestamp, data: { key, value } };
        const logRow = `${index};${timestamp};${JSON.stringify(logEntry.data)}\n`;

        fs.appendFileSync(this.logPath, logRow, 'utf8');
    }

    /*getLogContent() {
        if (!fs.existsSync(this.logPath)) {
            fs.writeFileSync(this.logPath, '');
            return '';
        }
        return fs.readFileSync(this.logPath, 'utf8');
    }
        */
    
    getLogContent(filePath = this.logPath) {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, '');
            return '';
        }
        return fs.readFileSync(filePath, 'utf8');
    }

    // this approach can be harmful to performance
    getNewestDataIndex() {

        const logContent = this.getLogContent();

        const logRows = logContent.split('\n');
        let newestIndex = -1;

        for (const row of logRows) {
            if (row.trim() !== '') {
                const index = parseInt(row.split(';')[0]);
                if (index > newestIndex) {
                    newestIndex = index;
                }
            }
        }

        return newestIndex;
    }

    getSegmentedSize(){
        return this.rotateSize;
    }

    removeLogContent(filePath,rowIndex){

        fs.readFile(filePath, 'utf8', (err,data) => {
            if(err)
                throw err;

            const lines = data.split('\n');
            lines.splice(rowIndex, 1);//Remove the specified line

            const updatedContent = lines.join('\n');
            fs.writeFileSync(filePath, updatedContent,'utf8', (err) => {
                if(err)
                    console.log("Can't remove log content.");
            });
        });

    }
    /*    The following is Segmented Log implementation    */

    getLog_NumberOfRow(){
        const logContent = this.getLogContent();

        const logRows = logContent.split('\n');
        let rowCount = 0;

        for(const row of logRows){
            if(row.trim() !== ''){
                rowCount++;
            }
        }

        return rowCount;
    }

    getFileIndex(filePath){
        const fileName = path.basename(filePath);
        const NameAndSuffix = fileName.split(this.logSuffix);
        const PrefixAndIndex = NameAndSuffix[0].split('_');

        if(PrefixAndIndex[0] === this.logPrefix){
            return parseInt(PrefixAndIndex[1]);
        }
        return -1;
    }
    searchLogFile(fileIndex){
        const dir = path.dirname(this.logPath);
        const files = fs.readdirSync(dir);
        const fileName = `wal_${fileIndex}.log`;

        for(const file of files){
            const filePath = path.join(dir,file);
            if(file.endsWith(fileName)){
                return filePath;
            }
        }
        return -1;
    }

    searchLogData(filePath, dataIndex){
        const logContent = this.getLogContent(filePath);
        const logRows = logContent.split('\n');
        for(const row of logRows){
            if(row.trim() !== ''){
                const index = parseInt(row.split(';')[0]);
                if(index === dataIndex){
                    return row; 
                }
            }
        }
        return -1;
    }
    getNewestFileIndex(){
        const directory = path.dirname(this.logPath);

        let newestIndex = 0;

        fs.readdir(directory).forEach(file =>{
            if(file.startsWith(this.logPrefix) && file.endsWith(this.logSuffix)){
                let index = this.getFileIndex(file);
                if(index > newestIndex){
                    newestIndex = index;
                }
            }
        });

        return newestIndex;
    }

    getNewLogIndex(){

        const logContent = this.getLogContent();
        const row = logContent.split('\n');

        const rowIndex = this.getSegmentedSize();

        var index = -1;

        if (row[rowIndex-1].trim() !== '') {
            index = parseInt(row[rowIndex].split(';')[0]);
        }
        return index;
    }

    createNewLog(fileIndex){

        const fileName = `wal_${fileIndex}.log`;

        const dirPath = path.dirname(this.logPath);
        const filePath = path.join(dirPath, fileName);

        fs.writeFileSync(filePath,'');

        return filePath;
    }

    getOldFilePath(){
        const oldLogIndex = this.getNewestFileIndex();
        const oldFileName = `wal_${oldLogIndex}.log`;

        const dirPath = path.dirname(this.logPath);
        const oldFilePath = path.join(dirPath, oldFileName);

        return oldFilePath;
    }

    getRotateData(){
        const logContent = this.getLogContent();
        const logRows = logContent.split('\n');
        var index = this.getSegmentedSize();
        let row = logRows[index];
        return row;
    }

    maybeRotate(){
        let newFilePath = this.logPath;
        if(this.getLog_NumberOfRow() >= this.getSegmentedSize()){

            let row = this.getRotateData();
            
            if(row.trim()!==''){

                row += '\n'; 
 
                const newFileIndex = parseInt(row.split(';')[0]);
                 
                newFilePath = this.createNewLog(newFileIndex)

                fs.appendFileSync(newFilePath, row);

                this.removeLogContent(this.logPath,this.getSegmentedSize())
            }
        }
        // this approach can be harmful to performance
        //this.logPath = this.findLatestLogFile(path.dirname(this.logPath));
        
        this.logPath = newFilePath;
    }
}

export default WriteAheadLog;





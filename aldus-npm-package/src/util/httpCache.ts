import * as fs from 'fs'
import * as crypto from 'crypto'
import * as path from 'path'
import  axios from 'axios'

export class HttpCache {

    constructor(protected path:string) {
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
        }

    }


    async get(url:string) {


        const hash = crypto.createHash('md5').update(url).digest("hex")

        const cacheFilePath = path.join(this.path, hash)

        if (fs.existsSync(cacheFilePath)) {

            return fs.readFileSync(cacheFilePath)
        }
        else {
            const res = await axios.get(url, {responseType:'blob'})

            
            fs.writeFileSync(cacheFilePath,res.data)

            return res.data
        }
    }
}
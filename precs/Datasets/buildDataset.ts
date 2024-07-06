interface RemoteUrlInfo {
    // Define the properties of the RemoteUrlInfo object here
    url: string;
    name: string;
  }

/* 
 * Interface representing a dataset object.
 */
export interface DatasetObject {
    basicInfo: {
        databundleVersionType:string,
        remoteUrlInfos:RemoteUrlInfo[],
        files:[],
        directories:[]
    },
    title:string,
    slug:string,
    isPrivate:boolean,
    licenseId:number,
    ownerUserId:number,
    referrer:string
}    

/*
 * Class for managing dataset information.
 */
export class Dataset {
    basicInfo: object;
    databundleVersionType:string;
    remoteUrlInfos:RemoteUrlInfo[]=[];
    files:[];
    directories:[];
    title:string;
    slug:string;
    isPrivate:boolean;
    licenseId:number;
    ownerUserId:number;
    referrer:string

    /** 
     * Static method to create an instance of Dataset.
     *
     * @returns An instance of Dataset.
     */
    public static builder(): Dataset {
        return new Dataset();
    }

    /**
     * Builds and returns the DatasetObject.
     *
     * @returns The DatasetObject.
     */
    public build(): DatasetObject{
        return {
            basicInfo: {
                databundleVersionType:"REMOTE_URL_FILE_SET",
                remoteUrlInfos:this.remoteUrlInfos,
                files:[],
                directories:[]
            },
            title:this.title,
            slug:this.slug,
            isPrivate:true,
            licenseId:4,
            ownerUserId:this.ownerUserId,
            referrer:"datasets_km"
        };
    }

    /** 
     * Sets the owner user ID for the Dataset.
     *
     * @returns The Dataset instance for method chaining.
     */
    public setOwnerUserId(): this {
        this.ownerUserId = Number(process.env.USER_ID);
        return this;
    }

    /** 
     * Sets the slug for the Dataset.
     *
     * @param slug - The slug to set.
     * @returns The Dataset instance for method chaining.
     */
    public setSlug(): this {
        this.slug = this.title.toLowerCase();
        return this;
    }

    /** 
     * Sets the title for the Dataset.
     *
     * @param title - The title to set.
     * @returns The Dataset instance for method chaining.
     */
    public setTitle(title: string): this {
        this.title = title;
        return this;
    }

    /** 
     * Sets the an array of objects with remote files for the Dataset.
     *
     * @param files - an array with remote files links.
     * @returns The Dataset instance for method chaining.
     */
    public setRemoteFiles(files:string[]): this {
        for(let file of files){
            const fileName = file.split('/');
            const name:string = fileName[fileName.length-1];
            const url:string = file;
            const object = {
                name:name,
                url:url
            };
            this.remoteUrlInfos.push(object);
        }
        console.log(this.remoteUrlInfos)
        return this
    }
}
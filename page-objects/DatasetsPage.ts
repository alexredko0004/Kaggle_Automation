import { Locator, expect} from "@playwright/test";
import { Header } from "./Header";

export class Datasets extends Header{
    newDatasetBtn: Locator
    continueBtn: Locator
    createBtn: Locator
    resetBtn: Locator
    datasetTitleField: Locator
    linkTab: Locator
    urlField: Locator
    trippleDotsBtn: Locator

    constructor(page){
        super(page)
        this.continueBtn = page.locator('.drawer-outer-container button').getByText('Continue')
        this.createBtn = page.locator('.drawer-outer-container button').getByText('Create')
        this.resetBtn = page.locator('.drawer-outer-container button').getByText('Reset')
        this.linkTab = page.locator('.drawer-outer-container button').getByText('Link')
        this.urlField = page.getByPlaceholder('Enter remote URL')
        this.datasetTitleField = page.getByPlaceholder('Enter dataset title')
        this.trippleDotsBtn = page.locator('[aria-label="more_vert"]').first()
    }
    
    public async openDatasetsPage(){
        await this.page.goto('/datasets')
    }
 /**
 * 
 * @param name - name of dataset
 */
    public async addDatasetUsingFileUpload(name:string){
        await this.newBtn.click();
        await this.page.getByPlaceholder('Drag and drop image to upload').setInputFiles('./resources/123.jpg');
        await this.datasetTitleField.fill(`${name}`);
        await expect(this.createBtn).not.toHaveAttribute('disabled');
        const responsePromise = this.page.waitForResponse('https://www.kaggle.com/api/i/datasets.DatasetService/CreateDataset');
        await this.createBtn.click();
        await expect(this.page.locator('.drawer-outer-container h2').last()).toHaveText('Success!');
        const request = await responsePromise;
        await expect(request.status()).toEqual(200); 
        await this.page.locator('.drawer-outer-container button').getByText('Go to Dataset').click()

    }
/**
 * 
 * @param name - name of dataset
 * @param url - URL of remote file
 */
    public async addDatasetUsingRemoteLink(name:string,url:string){
        await this.newBtn.click();
        await this.linkTab.click();
        await this.urlField.fill(`${url}`);
        await expect(this.continueBtn).not.toHaveAttribute('disabled');
        await this.page.waitForTimeout(500);
        await this.continueBtn.click();
        await this.datasetTitleField.fill(`${name}`);
        const responsePromise = this.page.waitForResponse('https://www.kaggle.com/api/i/datasets.DatasetService/CreateDataset');
        await this.createBtn.click();
        await expect(this.page.locator('.drawer-outer-container h2').last()).toHaveText('Success!');
        const request = await responsePromise;
        await expect(request.status()).toEqual(200); 
        await this.page.locator('.drawer-outer-container button').getByText('Go to Dataset').click()
    }

    public async deleteDatasetFromItsPage(){
        await this.trippleDotsBtn.click();
        await this.page.getByRole('menuitem').getByText('Delete dataset').click();
        await this.page.getByRole('button').getByText('Delete').click();
        await this.page.waitForURL('**/deleted-dataset/**');
        expect(this.page.url()).toContain('deleted-dataset');
        await expect(this.page.locator('#site-content h2').last()).toHaveText('Dataset deleted')
    }

    public async deleteDatasetsContainingName(name:string){
        await this.page.waitForTimeout(1500);
        for(let title of await this.page.locator('#site-content ul li',{hasText:`${name}`}).all()){
            await title.locator('[type="checkbox"]').check();
        }
        await this.page.getByTitle('Delete selected items').click();
        await this.page.locator('.drawer-outer-container input').check();
        await this.page.locator('.drawer-outer-container button').getByText('Continue').click();
        await this.page.getByRole('alertdialog').getByRole('button').getByText('Delete').click();
    }
}
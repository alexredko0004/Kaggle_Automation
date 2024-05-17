import { Locator, expect} from "@playwright/test";
import { Header } from "./Header";

export class Models extends Header{
    newModelBtn: Locator
    urlEditBtn: Locator
    modelTitleField: Locator
    modelURLField: Locator
    createModelBtn: Locator
    visibilityDropDown: Locator
    goToModelDetailBtn: Locator

    resetBtn: Locator
    trippleDotsBtn: Locator

    constructor(page){
        super(page)
        this.modelTitleField = page.getByPlaceholder('Enter model title')
        this.urlEditBtn = page.locator('.drawer-outer-container').getByText('Edit')
        this.modelURLField = page.locator('input[placeholder=""]')
        this.visibilityDropDown = page.locator('button[role="combobox"]').first()
        this.createModelBtn = page.locator('//button[.="Create model"]')
        this.goToModelDetailBtn = page.locator('.drawer-outer-container button').getByText('Go to model detail page')
    }
    
    public async openModelsPage(){
        await this.page.goto('/models')
    }
 /**
 * 
 * @param name - name of model
 * @param url - ending of url for new model
 * @param visibility - 'Private' or 'Public'
 */
    public async addModelWithoutVariations(name:string,url:string,visibility:string){
        await this.newBtn.click();
        await expect(this.createModelBtn).toBeDisabled();
        await this.modelTitleField.fill(name);
        await this.urlEditBtn.click();
        await expect(this.modelURLField).toBeVisible();
        await this.modelURLField.fill(url);
        await this.visibilityDropDown.click();
        await this.page.locator('li',{hasText:'visibility'+visibility}).click();
        await expect(this.createModelBtn).toBeEnabled();
        await this.createModelBtn.click();
        const response = await this.page.waitForResponse('https://www.kaggle.com/api/i/models.ModelService/CreateModel');
        expect(response.status()).toEqual(200); 
        await expect(this.page.locator('.mdc-layout-grid__cell').first().getByText(url)).toBeVisible();
    }
/**
 * 
 * @param name - name of dataset
 * @param url - URL of remote file
 */
    // public async addDatasetUsingRemoteLink(name:string,url:string){
    //     await this.newDatasetBtn.click();
    //     await this.linkTab.click();
    //     await this.urlField.fill(`${url}`);
    //     await expect(this.continueBtn).not.toHaveAttribute('disabled');
    //     await this.page.waitForTimeout(500);
    //     await this.continueBtn.click();
    //     await this.datasetTitleField.fill(`${name}`);
    //     const responsePromise = this.page.waitForResponse('https://www.kaggle.com/api/i/datasets.DatasetService/CreateDataset');
    //     await this.createBtn.click();
    //     await expect(this.page.locator('.drawer-outer-container h2').last()).toHaveText('Success!');
    //     const request = await responsePromise;
    //     await expect(request.status()).toEqual(200); 
    //     await this.page.locator('.drawer-outer-container button').getByText('Go to Dataset').click()
    // }

    // public async deleteDatasetFromItsPage(){
    //     await this.trippleDotsBtn.click();
    //     await this.page.getByRole('menuitem').getByText('Delete dataset').click();
    //     await this.page.getByRole('button').getByText('Delete').click();
    //     await this.page.waitForURL('**/deleted-dataset/**');
    //     expect(this.page.url()).toContain('deleted-dataset');
    //     await expect(this.page.locator('#site-content h2').last()).toHaveText('Dataset deleted')
    // }

    // public async deleteDatasetsContainingName(name:string){
    //     await this.page.waitForTimeout(1500);
    //     for(let title of await this.page.locator('#site-content [role="listitem"]',{hasText:`${name}`}).all()){
    //         await title.locator('[type="checkbox"]').check();
    //     }
    //     await this.page.getByTitle('Delete selected items').click();
    //     await this.page.locator('.drawer-outer-container input').check();
    //     await this.page.locator('.drawer-outer-container button').getByText('Continue').click();
    //     await this.page.getByRole('alertdialog').getByRole('button').getByText('Delete').click();
    // }
}
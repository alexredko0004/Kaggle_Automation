import { Locator, expect} from "@playwright/test";
import { BaseBusinessObjectPage } from "./BaseBusinessObjectPage";

export class Datasets extends BaseBusinessObjectPage{
    
    addSubtitlePendingAction:Locator
    continueBtn: Locator
    createBtn: Locator
    datasetTitleField: Locator
    datasetSubtitleField: Locator
    datasetSubtitleOnView: Locator
    goToDatasetBtn: Locator
    linkTab: Locator
    newDatasetBtn: Locator
    resetBtn: Locator
    saveChangesBtn: Locator
    trippleDotsBtn: Locator
    urlField: Locator

    constructor(page){
        super(page)
        this.addSubtitlePendingAction = page.getByTestId('dataset-detail-render-tid').getByTitle('Add a subtitle')
        this.continueBtn = page.locator('.drawer-outer-container button').getByText('Continue')
        this.createBtn = page.locator('.drawer-outer-container button').getByText('Create')
        this.datasetTitleField = page.getByPlaceholder('Enter dataset title')
        this.datasetSubtitleField = page.locator('input.MuiInputBase-input').nth(1)
        this.datasetSubtitleOnView = page.locator('[wrap="hide"] span')
        this.goToDatasetBtn = page.locator('.drawer-outer-container button').getByText('Go to Dataset')
        this.linkTab = page.locator('.drawer-outer-container button').getByText('Link')
        this.resetBtn = page.locator('.drawer-outer-container button').getByText('Reset')
        this.saveChangesBtn = page.locator('[data-testid="dataset-detail-render-tid"] button').getByText('Save Changes')
        this.trippleDotsBtn = page.locator('[aria-label="more_vert"]').first()
        this.urlField = page.getByPlaceholder('Enter remote URL')
    }
    
    public async openDatasetProfile(datasetName:string,datasetOwnerSlug:string){
        await this.page.goto(`/datasets/${datasetOwnerSlug}/${datasetName}`)
    }

    public async openDatasetsPage(){
        await this.page.goto('/datasets')
    }

    public async clickAddSubtitlePendingAction(){
        await this.addSubtitlePendingAction.click()
    }
    
    public async clickContinueBtnWhileCreatingDataset(){
        const waitPromise = this.page.waitForResponse(response=>response.url().includes('api/i/datasets.DatasetService/GetRemoteUrlFileInfo')&&response.status()===200);
        await this.continueBtn.click();
        await waitPromise
    }

    public async clickCreateBtnAndGetDatasetProperties():Promise<{datasetID:string,ownerSlug:string,datasetSlug:string}>{
        const responsePromise1 = this.page.waitForResponse('https://www.kaggle.com/api/i/datasets.DatasetService/CreateDataset',{timeout:30000});
        await this.createBtn.click();
        const response = await (await responsePromise1).json();
        return {
            datasetID:response.datasetVersionReference.datasetId,
            ownerSlug:response.datasetVersionReference.ownerSlug,
            datasetSlug:response.datasetVersionReference.slug
        }
    }

    public async clickGoToDatasetBtn(){
        const waitPromise = this.page.waitForResponse(async response => {
            if (response.url().includes('api/i/datasets.DatasetService/GetDatabundleVersionCreationStatus')) {
              const responseBody = await response.json();
              return responseBody.creationPercentComplete === 1;
            }
            return false;
          });
          
        await waitPromise
        await this.goToDatasetBtn.click()
    }

    public async clickLinkTabWhileCreatingDataset(){
        await this.linkTab.click()
    }
    
    public async clickNewDatasetBtn(){
        await this.newBtn.click()
    }

    public async clickSaveChangesBtn(){
        await this.page.waitForTimeout(2000);
        await this.saveChangesBtn.click()
    }

    public async fillDatasetNameWhileCreatingDataset(name:string){
        await this.datasetTitleField.fill(name)
    }

    public async fillURLFieldWhileCreatingDataset(url:string){
        await this.urlField.fill(url);
    }

    public async fillSubtitleWhileEditingDataset(subtitle:string){
        await this.datasetSubtitleField.fill(subtitle);
    }

    public async getDatasetName(){
        return this.page.getByTestId('dataset-detail-render-tid').locator('h1').innerText()
    }

    public async getSubtitleInputValue(){
        return await this.datasetSubtitleField.getAttribute('value')
    }

    public async getSubtitleOnView(){
        return await this.datasetSubtitleOnView.innerText()
    }

    public async isCreateBtnEnabled(){
        return await this.createBtn.isEnabled()
    }

    public async isSaveChangesBtnEnabled(){
        return await this.saveChangesBtn.isEnabled()
    }

    public async isTabWithNameSelected(tabName:string){
        const isSelected = await this.page.getByLabel(`${tabName}`).getAttribute('aria-selected');  
        return (isSelected==='true')
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
            console.log(title+' is checked')
        }
        await this.page.getByTitle('Delete selected items').click();
        await this.page.locator('.drawer-outer-container input').check();
        await this.page.locator('.drawer-outer-container button').getByText('Continue').click();
        await this.page.getByRole('dialog').getByRole('button').getByText('Delete').click();
    }
}
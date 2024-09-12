import { Locator, expect} from "@playwright/test";
import { BaseBusinessObjectPage } from "./BaseBusinessObjectPage";

export class Datasets extends BaseBusinessObjectPage{
    
    addDescriptionPendingAction: Locator
    addSubtitlePendingAction:Locator
    continueBtn: Locator
    createBtn: Locator
    datasetDescriptionField: Locator
    datasetSubtitleField: Locator
    datasetSubtitleOnView: Locator
    datasetTitleField: Locator
    goToDatasetBtn: Locator
    leftBtnForPendingActions: Locator
    linkTab: Locator
    newDatasetBtn: Locator
    resetBtn: Locator
    rightBtnForPendingActions: Locator
    saveChangesBtn: Locator
    trippleDotsBtn: Locator
    urlField: Locator
    usabilityValue: Locator

    constructor(page){
        super(page)
        this.addDescriptionPendingAction = page.getByTestId('dataset-detail-render-tid').getByTitle('Add a description')
        this.addSubtitlePendingAction = page.getByTestId('dataset-detail-render-tid').getByTitle('Add a subtitle')
        this.continueBtn = page.locator('.drawer-outer-container button').getByText('Continue')
        this.createBtn = page.locator('.drawer-outer-container button').getByText('Create')
        this.datasetTitleField = page.getByPlaceholder('Enter dataset title')
        this.datasetDescriptionField = page.getByTestId('markdownEditor').locator('textarea.MuiInputBase-inputMultiline').first()
        this.datasetSubtitleField = page.locator('input.MuiInputBase-input').nth(1)
        this.datasetSubtitleOnView = page.locator('[wrap="hide"] span')
        this.goToDatasetBtn = page.locator('.drawer-outer-container button').getByText('Go to Dataset')
        this.leftBtnForPendingActions = page.getByLabel('chevron_left')
        this.linkTab = page.locator('.drawer-outer-container button').getByText('Link')
        this.resetBtn = page.locator('.drawer-outer-container button').getByText('Reset')
        this.rightBtnForPendingActions = page.getByLabel('chevron_right')
        this.saveChangesBtn = page.locator('[data-testid="dataset-detail-render-tid"] button').getByText('Save Changes')
        this.trippleDotsBtn = page.locator('[aria-label="more_vert"]').first()
        this.urlField = page.getByPlaceholder('Enter remote URL')
        this.usabilityValue = page.getByTestId('usability-value')
    }
    
    public async openDatasetProfile(datasetName:string,datasetOwnerSlug:string){
        await this.page.goto(`/datasets/${datasetOwnerSlug}/${datasetName}`)
    }

    public async openDatasetsPage(){
        await this.page.goto('/datasets')
    }
    public async clickAddDescriptionPendingAction(){
        await this.addDescriptionPendingAction.click()
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

    public async clickLeftBtnForPendingActions(){
        await this.leftBtnForPendingActions.click()
    }

    public async clickLinkTabWhileCreatingDataset(){
        await this.linkTab.click()
    }
    
    public async clickNewDatasetBtn(){
        await this.newBtn.click()
    }

    public async clickRightBtnForPendingActions(){
        await this.page.waitForTimeout(500);
        await this.rightBtnForPendingActions.click()
    }

    public async clickSaveChangesBtn(){
        await this.page.waitForTimeout(2000);
        await this.saveChangesBtn.click()
    }

    public async clickSaveForSection(sectionName:string){
        const saveBtn = this.page.locator(`//h2[contains(text(),'${sectionName}')]/parent::div/parent::div/parent::div/parent::div`)
                                       .getByRole('button').filter({hasText:'Save'});
        await saveBtn.click();
        await this.page.waitForTimeout(1000);
    }

    
    public async fillDatasetNameWhileCreatingDataset(name:string){
        await this.datasetTitleField.fill(name)
    }

    public async fillDescriptionWhileEditingDataset(description:string){
        await this.datasetDescriptionField.fill(description);
    }

    public async fillURLFieldWhileCreatingDataset(url:string){
        await this.urlField.fill(url);
    }

    public async fillSubtitleWhileEditingDataset(subtitle:string){
        await this.datasetSubtitleField.fill(subtitle);
    }

    public async getDatasetCompletenessCredibilityCompatibilityStats():
    Promise<{completeness:{
            value:number,
            isSubtitleChecked:boolean,
            isTagChecked:boolean,
            isDescriptionChecked:boolean,
            isCoverImageChecked:boolean
        },
        credibility:{
            value:number,
            isUpdateFrequencyChecked:boolean
        },
        compatibility:{
            value:number,
            isLicenseChecked:boolean,
            isFileDescriptionChecked:boolean
        }}>{
        const datasetUsabilityStatsTooltip = this.page.locator('[role="presentation"] .MuiPaper-elevation');
        const usabilityInfoIcon = this.page.getByRole('tooltip');
        await usabilityInfoIcon.waitFor();
        await usabilityInfoIcon.hover();

        //get value for comleteness:
        const completenessMatch = (await datasetUsabilityStatsTooltip.locator('p[font-weight="bold"]').first().innerText()).match(/\d+/);
        const completenessValue = (completenessMatch&&completenessMatch.length>0)?+completenessMatch[0]:0;
            //get subtitle item sign:
            const subtitleSign = await datasetUsabilityStatsTooltip.getByLabel('Subtitle List Item').locator('i').innerText();
            //get tag item sign:
            const tagSign = await datasetUsabilityStatsTooltip.getByLabel('Tag List Item').locator('i').innerText();
            //get description item sign:
            const descriptionSign = await datasetUsabilityStatsTooltip.getByLabel('Description List Item',{exact:true}).locator('i').innerText();
            //get cover image item sign:
            const coverImageSign = await datasetUsabilityStatsTooltip.getByLabel('Cover Image List Item').locator('i').innerText();

        //get value for credibility:
        const credibilityMatch = (await datasetUsabilityStatsTooltip.locator('p[font-weight="bold"]').nth(1).innerText()).match(/\d+/);
        const credibilityValue = (credibilityMatch&&credibilityMatch.length>0)?+credibilityMatch[0]:0;
            //get cover image item sign:
            const updateFrequencySign = await datasetUsabilityStatsTooltip.getByLabel('Update Frequency List Item').locator('i').innerText();

        //get value for compatibility:
        const compatibilityMatch = (await datasetUsabilityStatsTooltip.locator('p[font-weight="bold"]').nth(1).innerText()).match(/\d+/);
        const compatibilityValue = (compatibilityMatch&&compatibilityMatch.length>0)?+compatibilityMatch[0]:0;
            //get cover image item sign:
            const licenseSign = await datasetUsabilityStatsTooltip.getByLabel('License List Item').locator('i').innerText();
            //get file description item sign:
            const fileDescriptionSign = await datasetUsabilityStatsTooltip.getByLabel('File Description List Item').locator('i').innerText();


        await this.page.getByTestId('dataset-detail-render-tid').click({force:true});
        await expect.poll(async () => await datasetUsabilityStatsTooltip.isVisible(), {timeout: 10000,}).toBe(false);
        return {
          completeness:{
            value:completenessValue,
            isSubtitleChecked:subtitleSign==="check",
            isTagChecked:tagSign==="check",
            isDescriptionChecked:descriptionSign==="check",
            isCoverImageChecked:coverImageSign==="check"
          },
          credibility:{
            value:credibilityValue,
            isUpdateFrequencyChecked:updateFrequencySign==="check"
          },
          compatibility:{
            value:compatibilityValue,
            isLicenseChecked:licenseSign==="check",
            isFileDescriptionChecked:fileDescriptionSign==="check"
          }

        }
    }

    public async getDatasetName(){
        return this.page.getByTestId('dataset-detail-render-tid').locator('h1').innerText()
    }

    public async getDescriptionOnView(){
        const h1 = await this.page.locator(`//h2[contains(text(),'About Dataset')]/parent::div/parent::div/parent::div/following-sibling::div//h1`).innerText();
        const h2 = await this.page.locator(`//h2[contains(text(),'About Dataset')]/parent::div/parent::div/parent::div/following-sibling::div//h2`).innerText();
        const paragraph = await this.page.locator(`//h2[contains(text(),'About Dataset')]/parent::div/parent::div/parent::div/following-sibling::div//p`).innerText();
        return {h1:h1, h2:h2, p:paragraph}
    }

    public async getSubtitleInputValue(){
        return await this.datasetSubtitleField.getAttribute('value')
    }

    public async getSubtitleOnView(){
        return await this.datasetSubtitleOnView.innerText()
    }

    public async getUsabilityValue(){
        await this.usabilityValue.waitFor();
        const value = await this.usabilityValue.innerText();
        return +value
    }

    // public async hoverOverUsabilityInfoIcon(){
    //     const usabilityInfoIcon = this.page.getByRole('tooltip');
    //     await usabilityInfoIcon.waitFor();
    //     await usabilityInfoIcon.hover()
    // }

    public async isAddDescriptionPendingActionVisible(){
        return await this.addDescriptionPendingAction.isVisible()
    }

    public async isAddSubtitlePendingActionVisible(){
        return await this.addSubtitlePendingAction.isVisible()
    }

    public async isCreateBtnEnabled(){
        return await this.createBtn.isEnabled()
    }

    public async isDatasetDescriptionFieldVisible(){
        return await this.datasetDescriptionField.isVisible()
    }

    public async isRightBtnEnabled(){
        await this.page.waitForTimeout(1000);
        return await this.rightBtnForPendingActions.getAttribute('disabled')===null
    }

    public async isSaveChangesBtnEnabled(){
        return await this.saveChangesBtn.isEnabled()
    }

    public async isTabWithNameSelected(tabName:string){
        const isSelected = await this.page.getByLabel(`${tabName}`).getAttribute('aria-selected');  
        return (isSelected==='true')
    }

    public async selectTabOnDatasetProfile(tabName:string){
        await this.page.getByRole('tab').getByText(tabName).click()
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
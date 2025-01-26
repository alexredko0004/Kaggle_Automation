import { Locator, expect} from "@playwright/test";
import { BaseBusinessObjectPage } from "./BaseBusinessObjectPage";

export class Datasets extends BaseBusinessObjectPage{
    
    addDescriptionPendingAction: Locator
    addFileInformationPendingAction: Locator
    addSubtitlePendingAction:Locator
    addTagsPendingAction: Locator
    collectionMethodologyInput: Locator
    continueBtn: Locator
    createBtn: Locator
    datasetDescriptionField: Locator
    datasetLicenseDropDown: Locator
    datasetSubtitleField: Locator
    datasetSubtitleOnView: Locator
    datasetTitleField: Locator
    editFileInformationBtn: Locator
    goToDatasetBtn: Locator
    leftBtnForPendingActions: Locator
    linkTab: Locator
    listItemUnderThreeDots: Locator
    newDatasetBtn: Locator
    resetBtn: Locator
    rightBtnForPendingActions: Locator
    saveChangesBtn: Locator
    sourcesInput: Locator
    specifyLicensePendingAction: Locator
    specifyProvenancePendingAction: Locator
    trippleDotsBtn: Locator
    threeDotsBtnOnDatasetProfile: Locator
    uploadImagePendingAction: Locator
    urlField: Locator
    usabilityValue: Locator

    constructor(page){
        super(page)
        this.addDescriptionPendingAction = page.getByTestId('dataset-detail-render-tid').getByTitle('Add a description')
        this.addFileInformationPendingAction = page.getByTestId('dataset-detail-render-tid').getByTitle('Add file information')
        this.addSubtitlePendingAction = page.getByTestId('dataset-detail-render-tid').getByTitle('Add a subtitle')
        this.addTagsPendingAction = page.getByTestId('dataset-detail-render-tid').getByTitle('Add tags')
        this.collectionMethodologyInput = page.locator('.collection-methods .MuiInputBase-multiline textarea[rows="4"]')
        this.continueBtn = page.locator('.drawer-outer-container button').getByText('Continue')
        this.createBtn = page.locator('.drawer-outer-container button').getByText('Create')
        this.datasetDescriptionField = page.getByTestId('markdownEditor').locator('textarea.MuiInputBase-inputMultiline').first()
        this.datasetLicenseDropDown = page.locator('.MuiFormControl-root').locator('div[aria-label="Select License"]')
        this.datasetSubtitleField = page.locator('input.MuiInputBase-input[minlength="20"]')
        this.datasetSubtitleOnView = page.locator('[wrap="hide"] span')
        this.datasetTitleField = page.getByPlaceholder('Enter dataset title')
        this.editFileInformationBtn = page.getByLabel('Edit file description',{exact:true})
        this.goToDatasetBtn = page.locator('.drawer-outer-container button').getByText('Go to Dataset')
        this.leftBtnForPendingActions = page.getByLabel('See previous actions')
        this.linkTab = page.locator('.drawer-outer-container button').getByText('Link')
        this.listItemUnderThreeDots = page.getByRole('menuitem')
        this.resetBtn = page.locator('.drawer-outer-container button').getByText('Reset')
        this.rightBtnForPendingActions = page.getByLabel('See next actions')
        this.saveChangesBtn = page.locator('[data-testid="dataset-detail-render-tid"] button').getByText('Save Changes')
        this.sourcesInput = page.locator('.sources .MuiInputBase-multiline textarea[rows="4"]')
        this.specifyLicensePendingAction = page.getByTestId('dataset-detail-render-tid').getByTitle('Specify a license')
        this.specifyProvenancePendingAction = page.getByTestId('dataset-detail-render-tid').getByTitle('Specify provenance')
        this.trippleDotsBtn = page.locator('[aria-label="more_vert"]').first()
        this.threeDotsBtnOnDatasetProfile = page.getByLabel("More options for this dataset")
        this.uploadImagePendingAction = page.getByTestId('dataset-detail-render-tid').getByTitle('Upload an image')
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

    public async clickAddFileInformationPendingAction(){
        await this.addFileInformationPendingAction.click()
    }

    public async clickAddSubtitlePendingAction(){
        await this.addSubtitlePendingAction.click()
    }

    public async clickAddTagsPendingAction(){
        await this.addTagsPendingAction.click()
    }
    
    public async clickContinueBtnWhileCreatingDataset(){
        const waitPromise = this.page.waitForResponse(response=>response.url().includes('api/i/datasets.DatasetService/GetRemoteUrlFileInfo')&&response.status()===200);
        await this.continueBtn.click();
        await waitPromise
    }

    public async clickCreateBtnAndGetDatasetProperties():Promise<{datasetID:string,ownerSlug:string,datasetSlug:string}>{
        const responsePromise1 = this.page.waitForResponse(`${process.env.CREATE_DATASET_ENDPOINT}`,{timeout:30000});
        await this.createBtn.click();
        const responseToReturn = await (await responsePromise1).json();
        // return {
        //     datasetID:response.datasetVersionReference.datasetId,
        //     ownerSlug:response.datasetVersionReference.ownerSlug,
        //     datasetSlug:response.datasetVersionReference.slug
        // }
        return new Promise ((resolve)=>{
            const responseHandler = async (response)=>{
                if(response.url().includes('api/i/datasets.DatasetService/GetDatabundleVersionCreationStatus')){
                    const responseBody = await response.json();
                    if (responseBody.creationPercentComplete === 1){
                        this.page.off('response',responseHandler)
                        resolve({
                                datasetID:responseToReturn.datasetVersionReference.datasetId,
                                ownerSlug:responseToReturn.datasetVersionReference.ownerSlug,
                                datasetSlug:responseToReturn.datasetVersionReference.slug
                            })
                    }
                }
            }
            this.page.on('response',responseHandler)
        })
    }

    public async clickEditForDatasetSectionWithName(name:"Author"|"Coverage"|"DOI Citation"|"Provenance"|"License"|"Expected Update Frequency"){
        const editBtnForSection = this.page.getByLabel(`Edit ${name}`);
        await editBtnForSection.click()
    }

    public async clickEditFileInformationBtn(){
        await this.editFileInformationBtn.click()
    }

    public async clickGoToDatasetBtn(){
        // this.page.on('response', async response => {
        //     if (response.url().includes('api/i/datasets.DatasetService/GetDatabundleVersionCreationStatus')) {
        //             const responseBody = await response.json();
        //             if (responseBody.creationPercentComplete === 1) return
        //     }
        // });
        await this.goToDatasetBtn.click({force:true})
        



        // const waitPromise = this.page.waitForResponse(async response => {
        //     if (response.url().includes('api/i/datasets.DatasetService/GetDatabundleVersionCreationStatus')) {
        //       const responseBody = await response.json();
        //       return responseBody.creationPercentComplete === 1;
        //     }
        //     return false;
        //   });
          
        // await waitPromise
        // await this.goToDatasetBtn.click()
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

    public async clickSaveBtnForFileInformation(){
        const saveBtn = this.page.getByRole('button').getByText('Save',{exact:true});
        await saveBtn.click();
        await this.page.waitForTimeout(1000)
    }

    public async clickSpecifyLicensePendingAction(){
        await this.specifyLicensePendingAction.click()
    }

    public async clickSaveForSection(sectionName:string){
        const saveBtn = this.page.locator(`//h2[contains(text(),'${sectionName}')]/parent::div/parent::div/parent::div/parent::div`)
                                       .getByRole('button').filter({hasText:'Save'});
        await saveBtn.click();
        await this.page.waitForTimeout(1000);
    }

    public async clickSaveOnEditDatasetImagePanel(){
        const saveBtn = this.page.locator('.drawer-outer-container button').nth(2);
        await saveBtn.click();
        await this.page.waitForRequest('https://www.kaggle.com/api/i/datasets.DatasetDetailService/GetDatasetImageInfo');
    }

    public async clickSpecifyProvenancePendingAction(){
        await this.specifyProvenancePendingAction.click()
    }

    public async clickStartOrEndDateField(fieldName:"Start Date"|"End Date"){
        let classToSelect;
        (fieldName==='Start Date')?classToSelect='.coverage-start':classToSelect='.coverage-end';
        const field = this.page.locator(classToSelect).locator('button');
        await field.click()
    }

    public async clickThreeDotsBtnOnProfile(){
        await this.threeDotsBtnOnDatasetProfile.click()
    }

    public async clickUploadImagePendingAction(){
        await this.uploadImagePendingAction.click()
    }

    public async fillCollectionMethodologyInput(text:string){
        await this.collectionMethodologyInput.fill(text)
    }

    public async fillDatasetNameWhileCreatingDataset(name:string){
        await this.datasetTitleField.fill(name)
    }

    public async fillDescriptionWhileEditingDataset(description:string){
        await this.datasetDescriptionField.fill(description);
    }

    public async fillFileInformationField(information:string){
        const fileInformationField = this.page.getByPlaceholder('Add a description for this file');
        await fileInformationField.fill(information);
    }

    public async fillURLFieldWhileCreatingDataset(url:string){
        await this.urlField.fill(url);
    }

    public async fillSubtitleWhileEditingDataset(subtitle:string){
        await this.datasetSubtitleField.fill(subtitle);
    }

    public async fillSourcesInput(text:string){
        await this.sourcesInput.fill(text);
    }

    public async getDatasetAttachmentSizeNumber(){
        const attSizeNumber = (await this.page.locator('//*[contains(text(),"Version")]/parent::p').innerText()).match(/\d{1,3}\.\d{1,3}/)
        const sizeNumber = (attSizeNumber&&attSizeNumber.length>0)?+attSizeNumber[0]:0;
        return sizeNumber
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
            isUpdateFrequencyChecked:boolean,
            isSourceProvenanceChecked:boolean
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
            const subtitleSign = await datasetUsabilityStatsTooltip.getByLabel('Subtitle List Item').locator('span').innerText();
            //get tag item sign:
            const tagSign = await datasetUsabilityStatsTooltip.getByLabel('Tag List Item').locator('span').innerText();
            //get description item sign:
            const descriptionSign = await datasetUsabilityStatsTooltip.getByLabel('Description List Item',{exact:true}).locator('span').innerText();
            //get cover image item sign:
            const coverImageSign = await datasetUsabilityStatsTooltip.getByLabel('Cover Image List Item').locator('span').innerText();

        //get value for credibility:
        const credibilityMatch = (await datasetUsabilityStatsTooltip.locator('p[font-weight="bold"]').nth(1).innerText()).match(/\d+/);
        const credibilityValue = (credibilityMatch&&credibilityMatch.length>0)?+credibilityMatch[0]:0;
            //get update frequency sign:
            const updateFrequencySign = await datasetUsabilityStatsTooltip.getByLabel('Update Frequency List Item').locator('span').innerText();
            //get source/provenance sign:
            const sourceProvenanceSign = await datasetUsabilityStatsTooltip.getByLabel('Source/Provenance List Item').locator('span').innerText();

        //get value for compatibility:
        const compatibilityMatch = (await datasetUsabilityStatsTooltip.locator('p').last().innerText()).match(/\d+/);
        const compatibilityValue = (compatibilityMatch&&compatibilityMatch.length>0)?+compatibilityMatch[0]:0;
            //get license item sign:
            const licenseSign = await datasetUsabilityStatsTooltip.getByLabel('License List Item').locator('span').innerText();
            //get file description item sign:
            const fileDescriptionSign = await datasetUsabilityStatsTooltip.getByLabel('File Description List Item').locator('span').innerText();


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
            isUpdateFrequencyChecked:updateFrequencySign==="check",
            isSourceProvenanceChecked:sourceProvenanceSign==="check"
          },
          compatibility:{
            value:compatibilityValue,
            isLicenseChecked:licenseSign==="check",
            isFileDescriptionChecked:fileDescriptionSign==="check"
          }

        }
    }

    public async getDatasetLicense(){
        const license = await this.page.locator('//h2[contains(text(),"License")]/parent::div/parent::div/parent::div/parent::div/following-sibling::div//a').innerText()
        return license
    }

    public async getDatasetName(){
        return this.page.getByTestId('dataset-detail-render-tid').locator('h1').innerText()
    }

    public async getDatasetSourceAndCollectionMethodology(){
        const source = await this.page.locator('.sources p').innerText();
        const collectionMethodology = await this.page.locator('.collection-methods p').innerText();
        return {source:source,collectionMethodology:collectionMethodology}
    }

    public async getDatasetTags():Promise<string[]>{
        const tagsArray = await this.page.locator('#combo-tags-menu-chipset a span').allInnerTexts();
        return tagsArray
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

    public async isAddDescriptionPendingActionVisible(){
        return await this.addDescriptionPendingAction.isVisible()
    }

    public async isAddFileInformationPendingActionVisible(){
        return await this.addFileInformationPendingAction.isVisible()
    }

    public async isAddSubtitlePendingActionVisible(){
        return await this.addSubtitlePendingAction.isVisible()
    }

    public async isAddTagsBtnVisible(){
        const addTagsBtn = this.page.getByRole('button').getByText('Add Tags')
        return await addTagsBtn.isVisible()
    }

    public async isAddTagsPendingActionVisible(){
        return await this.addTagsPendingAction.isVisible()
    }

    public async isCreateBtnEnabled(){
        return await this.createBtn.isEnabled()
    }

    public async isCollectionMethodologyInputVisible(){
        return await this.collectionMethodologyInput.isVisible()
    }

    public async isDatasetDescriptionFieldVisible(){
        return await this.datasetDescriptionField.isVisible()
    }

    public async isGeospatialCoverageFieldVisible(){
        const geospatialCoverageField = this.page.getByPlaceholder("City, Country or Worldwide")
        return await geospatialCoverageField.isVisible()
    }

    public async isEditDatasetImagePanelVisible(){
        await this.page.waitForTimeout(500);
        return await this.page.locator('.drawer-outer-container').isVisible()
    }

    public async isLicenseDropDownVisible(){
        await this.page.waitForTimeout(200)
        return await this.datasetLicenseDropDown.isVisible()
    }

    public async isRightBtnEnabled(){
        await this.page.waitForTimeout(1000);
        return await this.rightBtnForPendingActions.getAttribute('disabled')===null
    }

    public async isSaveChangesBtnEnabled(){
        return await this.saveChangesBtn.isEnabled()
    }

    public async isSaveBtnForSectionVisible(sectionName:string){
        const saveBtn = this.page.locator(`//h2[contains(text(),'${sectionName}')]/parent::div/parent::div/parent::div/parent::div`)
                                       .getByRole('button').filter({hasText:'Save'});
        return await saveBtn.isVisible()
    }

    public async isSourcesInputVisible(){
        return await this.sourcesInput.isVisible()
    }

    public async isSpecifyLicensePendingActionVisible(){
        return await this.specifyLicensePendingAction.isVisible()
    }

    public async isSpecifyProvenancePendingActionVisible(){
        return await this.specifyProvenancePendingAction.isVisible()
    }

    public async isStartEndDateFieldVisible(fieldName:"Start Date"|"End Date"){
        const field = this.page.getByLabel(fieldName);
        const visibility = await field.isVisible()
        return visibility
    }

    public async isTabWithNameSelected(tabName:string){
        const isSelected = await this.page.getByLabel(`${tabName}`).getAttribute('aria-selected');  
        return (isSelected==='true')
    }

    public async isUploadImagePendingActionVisible(){
        return await this.uploadImagePendingAction.isVisible()
    }

    
    /**
 * 
 * @param date - date to select in "DD Mon YYYY" format
 */
    public async selectDateInDatepicker(date:string){
        const yearToSelectMatch = date.match(/\d{4}/);
        const yearToSelect = (yearToSelectMatch&&yearToSelectMatch.length>0)?yearToSelectMatch[0]:'not found';

        const monthToSelectMatch = date.match(/[jJ]an|[fF]eb|[mM]ar|[aA]pr|[mM]ay|[jJ]u[nl]|[sS]ep|[oO]ct|[nN]ov|[dD]ec/);
        const monthToSelect = (monthToSelectMatch&&monthToSelectMatch.length>0)?monthToSelectMatch[0]:'not found';

        const dayToSelectMatch = date.match(/^\d{1,2}/);
        const dayToSelect = (dayToSelectMatch&&dayToSelectMatch.length>0)?dayToSelectMatch[0]:'not found';

        const shevronBtn = this.page.getByTestId('ExpandMoreIcon');
        let currentDate = new Date();
        if (yearToSelect!==currentDate.getFullYear().toString()){
             await this.page.waitForTimeout(800);
             await shevronBtn.click();
             await this.page.getByRole('radio').filter({hasText:yearToSelect}).click()
        }
    }

    public async selectDatasetLicense(licenseName:string){
        await this.datasetLicenseDropDown.click();
        await this.page.getByRole('listbox').locator('li',{hasText:licenseName}).click()
    }

    public async selectRandomDatasetLicense(){
        await this.datasetLicenseDropDown.click();
        const allOptions = await this.page.getByRole('listbox').locator('li:not([aria-disabled="true"])').allInnerTexts();
        let selectedOption = allOptions[Math.floor(Math.random()*allOptions.length)];
        selectedOption==='Unknown'?selectedOption = allOptions[Math.floor(Math.random()*allOptions.length)]:selectedOption;
        await this.page.getByRole('listbox').locator('li',{hasText:selectedOption}).click();
        return selectedOption.replace('info','')
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

    public async selectOptionFromThreeDotsMenu(option:string){
        await this.listItemUnderThreeDots.getByText(option,{exact:true}).click()
    }
}
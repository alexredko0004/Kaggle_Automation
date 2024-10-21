import { Locator, expect} from "@playwright/test";
import { BaseBusinessObjectPage } from "./BaseBusinessObjectPage";
import { waitForLocator } from "../helpers/waitForLocator";

export class Models extends BaseBusinessObjectPage{
    private readonly newModelBtn: Locator
    private readonly urlEditBtn: Locator
    private readonly modelNameFieldOnCreate: Locator
    private readonly modelURLField: Locator
    createModelBtn: Locator
    private readonly visibilityDropDown: Locator
    private readonly frameworkListOnCreate: Locator
    private readonly addNewVariationOnCreateBtn: Locator
    private readonly variationNameInput: Locator
    private readonly licenseListOnCreate: Locator
    addTagsBtn: Locator
    editTagsBtn: Locator
    private readonly goToModelBtn: Locator
    private readonly pencilEdit: Locator
    private readonly modelTitleFieldOnEdit: Locator
    private readonly modelSubtitleFieldOnEdit: Locator
    private readonly modelTitleFieldOnView: Locator
    private readonly modelSubTitleOnView: Locator
    private readonly modelDescriptionField: Locator
    private readonly modelVisibilityDropDown: Locator
    private readonly authorNameField: Locator
    private readonly autorWebsiteField: Locator
    private readonly addAuthorBtn: Locator
    private readonly modelAuthors: Locator
    private readonly threeDotsBtnOnModelProfile: Locator
    private readonly listItemUnderThreeDots: Locator
    addSubtitlePendingAction: Locator
    addTagsPendingAction: Locator
    private readonly saveBtn: Locator
    private readonly createBtn: Locator
    private readonly upvoteBtn: Locator
    private readonly upvotesCounter: Locator

    resetBtn: Locator
    trippleDotsBtn: Locator


    constructor(page){
        super(page)
        this.modelNameFieldOnCreate = page.getByPlaceholder('Model Name')
        this.urlEditBtn = page.locator('.drawer-outer-container span[role="button"]').first()
        this.modelURLField = page.locator('input[placeholder=""]')
        this.visibilityDropDown = page.locator('.drawer-outer-container').locator('div[aria-label="Select Visibility. Private currently selected."]')
        this.createModelBtn = page.locator('//button[.="Create model"]') 
        this.frameworkListOnCreate = page.locator('.drawer-outer-container').locator('div[aria-label="Select Framework. Select framework currently selected."]')
        this.addNewVariationOnCreateBtn = page.locator('button').getByText('addAdd new variation')
        this.variationNameInput = page.getByPlaceholder('Variation Name')
        this.licenseListOnCreate = page.locator('.drawer-outer-container').locator('div[aria-label="Select License"]')
        this.addTagsBtn = page.getByRole('button').filter({hasText:'Add Tags'})
        this.editTagsBtn = page.getByLabel('Edit Tags')
        this.goToModelBtn = page.locator('.drawer-outer-container button').getByText('Go to Model')
        this.pencilEdit = page.getByLabel('edit',{exact:true})
        this.modelTitleFieldOnEdit = page.getByPlaceholder('Enter a title')
        this.modelSubtitleFieldOnEdit = page.locator('#site-content [maxlength="255"]')
        this.modelTitleFieldOnView = page.locator('#site-content h1')
        this.modelSubTitleOnView = page.locator('[wrap="hide"] span p').nth(1)
        this.modelDescriptionField = page.getByPlaceholder('Describe the source of the model.')
        this.modelVisibilityDropDown = page.locator('//div[contains(@aria-label,"Select Visibility.")]')
        this.addAuthorBtn = page.locator('//button/span[.="Add Author"]')
        this.authorNameField = page.getByLabel('textfield-Author Name-label').locator('input')
        this.autorWebsiteField = page.getByLabel('textfield-Website-label').locator('input')
        this.modelAuthors = page.locator('#site-content p a').all()
        this.threeDotsBtnOnModelProfile = page.getByLabel("more_vert")
        this.listItemUnderThreeDots = page.getByRole('menuitem')
        this.addSubtitlePendingAction = page.getByTitle('Add a subtitle')
        this.addTagsPendingAction = page.getByTitle('Add tags')
        this.saveBtn = page.locator('button',{hasText:'Save'})
        this.createBtn = page.locator('.drawer-outer-container button').getByText('Create')
        this.upvoteBtn = page.getByTestId('upvotebutton__upvote')
        this.upvotesCounter = page.locator('//button/following-sibling::button[@mode]')
    }
    
    public async openModelsPage(){
        await this.page.goto('/models')
    }
     
    public async openModelProfile(ownerSlug:string,modelSlug:string){
        await this.page.goto(`/models/${ownerSlug}/${modelSlug}`)
        await this.page.waitForTimeout(2000)
    }
    
    public async fillModelNameFieldOnCreate(name:string){
        await this.modelNameFieldOnCreate.fill(name)
    }

    public async clickEditForURLOnCreate(){
        await this.urlEditBtn.click()
    }

    public async fillURLFieldOnCreate(url:string){
        await this.modelURLField.fill(url)
    }

    public async selectVisibilityOnCreate(visibility:string){
        const text = (visibility==='Private')?'visibility_off':'visibility';
        await this.visibilityDropDown.click();
        await this.page.locator(`li[aria-label=${visibility}]`).click();
        //await this.page.locator('li',{hasText:text+visibility}).click();
    }
    
    public async isCreateButtonEnabled(){
        return await this.createBtn.isEnabled()
    }

    public async getModelTitleOnCreate(){
        const title = await this.modelNameFieldOnCreate.inputValue();
        return title
    }

    public async getModelURLEndingOnCreate(){
        const urlEnding = await this.modelURLField.inputValue();
        return urlEnding
    }

    public async getModelSelectedVisibilityOnCreate(){
        const visibility = await this.visibilityDropDown.getAttribute('aria-label');
        return visibility
    }

    public async clickCreateModel(){
        await this.createModelBtn.click()
    }

    public async clickGoToModelDetailsBtn(){
        //Option_1
        // await expect.poll(()=> this.page.getByText('Files Processing...').isVisible()).toBe(false);
        // await expect.poll(()=> this.page.getByText('%').isVisible()).toBe(false);

        //Option_2
        const panel = this.page.locator("//div[@class='drawer-outer-container']//h2[.='Upload Data']");
        await panel.waitFor({state:'hidden',timeout:20000});
        const filesProcessing = this.page.getByText('Files processing...');
        const percentage = this.page.getByText('% processed');
        // await filesProcessing.waitFor({state:'hidden',timeout:20000});
        // await percentage.waitFor({state:'hidden',timeout:20000});
        // await Promise.race([
        //     filesProcessing.waitFor({ state: 'visible',timeout:10000}),
        //     percentage.waitFor({ state: 'visible' }),
        //   ])
        //Option_3
        if (await filesProcessing.isVisible()){
            await waitForLocator(
                this.page.getByText('Files processing...'),
                async ()=>this.page.getByText('Files processing...').isHidden(),
                20000,
                500
            )
        }else{
        await percentage.isVisible() 
        await waitForLocator(
            this.page.getByText('% processed'),
            async ()=>this.page.getByText('% processed').isHidden(),
            20000,
            500
        )
        }
        await this.goToModelBtn.click()
    }

    public async clickGoToModelBtn(){
        const waitPromise = this.page.waitForResponse(async response => {
            if (response.url().includes('api/i/datasets.DatasetService/GetDatabundleVersionCreationStatus')) {
              const responseBody = await response.json();
              return responseBody.creationPercentComplete === 1;
            }
            return false;
          });
          
        await waitPromise
        await this.goToModelBtn.click();
        await this.page.waitForTimeout(500)
    }

    public async selectFrameworkOnCreate(frameworkName:string){
        await this.frameworkListOnCreate.click();
        await this.page.locator('[role="option"]').getByText(frameworkName).click()
    }

    public async selectRandomFrameworkOnCreate(){
        await this.frameworkListOnCreate.click();
        const frameworkOptions = await this.page.locator('[role="option"]').allInnerTexts();
        const selectedFramework = frameworkOptions[Math.floor(Math.random()*frameworkOptions.length)];
        await this.page.locator('[role="option"]').getByText(selectedFramework).click();
        return selectedFramework
    }

    public async clickCreateAndGetIdAndSlug(){
        const responsePromise = this.page.waitForResponse('/api/i/models.ModelService/CreateModel', {
            timeout: 30000
        });
        await this.createBtn.click();
        const response = await (await responsePromise).json();
        return {id: response.id, ownerSlug: response.owner.slug}
    }
    public async clickAddNewVariationBtn(){
        await this.addNewVariationOnCreateBtn.click()
    }

    public async uploadVariationFile(path:string[]){
        const waitPromise = this.page.waitForResponse(response=>response.url().includes('kaggle-models-data/o?uploadType=resumable&upload_id')&&response.status()===200)
        await this.page.getByPlaceholder('Drag and drop image to upload').setInputFiles(path);
        await waitPromise
    }

    public async fillVariationNameInput(variationSlug:string){
        await this.variationNameInput.fill(variationSlug)
    }

    public async selectLicenseOnVariationCreate(licenseName:string='Unknown'){
        await this.licenseListOnCreate.click();
        await this.page.locator('[role="listbox"] [role="option"]',{hasText:licenseName}).click()
    }

    public async selectRandomLicenseOnVariationCreate(){
        await this.licenseListOnCreate.click();
        const optionsList = await this.page.locator('[role="listbox"] [role="option"]:not([aria-disabled="true"])').allInnerTexts();
        let selectedOption = optionsList[Math.floor(Math.random()*optionsList.length)];
        selectedOption==='Gemma'||selectedOption==='Other (specified in description)'?selectedOption = optionsList[Math.floor(Math.random()*optionsList.length)]:selectedOption;
        await this.page.locator('[role="listbox"] [role="option"]',{hasText:selectedOption}).click();
        return selectedOption.replace('info','')
    }

    public async getModelTitleOnView(){
        return this.modelTitleFieldOnView.innerText()
    }

    public async getModelVisibilitySettingOnView(){
        const innerText = (await this.modelVisibilityDropDown.innerText()).match(/(Private)|(Public)/);
        const properInnerText = (innerText&&innerText.length>0)?innerText[0]:0;
        return properInnerText
    }

    public async getModelVariationSlugVisibilityOnView(variationSlug){
        await this.page.waitForTimeout(2000);
        return await this.page.locator('div[aria-label="Select Variation"]').getByText(variationSlug).isVisible()
    }

    public async getModelVariationAttachmentVisibilityOnView(){
        return await this.page.getByTestId('preview-pdf').isVisible()
    }

    public async getModelVariationFrameworkOnView(){
        const variatonTabText = await this.page.locator('.MuiTabs-scroller button[role="tab"]').first().innerText();
        return variatonTabText.replace('\nedit','')
    }

    public async getModelVariationLicenseOnView(){
        const licenseText = await this.page.locator('a[rel="noopener noreferrer"]').innerText();
        return licenseText.replace(' open_in_new','')
    }

    public async clickPencilEditBtn(){
        await this.pencilEdit.click()
    }

    public async clickThreeDotsBtnOnProfile(){
        await this.threeDotsBtnOnModelProfile.click()
    }

    public async selectOptionFromThreeDotsMenu(option:string){
        await this.listItemUnderThreeDots.getByText(option,{exact:true}).click()
    }

    public async fillTitleOnEdit(title:string){
        await this.modelTitleFieldOnEdit.fill(title)
    }

    public async fillSubTitleOnEdit(subtitle:string){
        await this.modelSubtitleFieldOnEdit.fill(subtitle)
    }

    public async clearSubTitleOnEdit(){
        await this.modelSubtitleFieldOnEdit.clear()
    }

    public async isSubtitleVisibleOnModelProfile(){
        return await this.modelSubTitleOnView.isVisible()
    }

    public async clickAddTagsBtn(){
        await this.addTagsBtn.click()
    }

    public async clickEditTagsBtn(){
        await this.editTagsBtn.click()
    }
 
    public async clickSaveBtn(){
        await this.saveBtn.click()
    }

    public async clickCreateBtn(){
        await this.createBtn.click()
    }

    public randomModelVisibility (list:string[]) {
        return list[Math.floor((Math.random()*list.length))];
      }

    public getAddSubtitlePendingAction():Locator{
        return this.addSubtitlePendingAction
    }

    public getAddTagsBtn():Locator{
        return this.addTagsBtn
    }

    public getAddTagsPendingAction():Locator{
        return this.addTagsPendingAction
    }

    public getEditTagsBtn():Locator{
        return this.editTagsBtn
    }

    public async clickUpvoteBtn(){
        await this.upvoteBtn.click()
    }

    public async hoverOverUpvoteBtn(){
        await this.upvoteBtn.hover()
    }

    public async getUpvoteBtnMode(){
        const mode = await this.upvoteBtn.getAttribute('mode')
        return mode
    }

    public async getUpvotesCounterValue(){
        const counterValue = await this.upvotesCounter.innerText()
        return parseInt(counterValue)
    }












    public async openModelDetailsForEdit(){
        await this.page.locator('//button/span[.="Edit"][1]').click();
        await expect(this.modelDescriptionField).toBeVisible()
    }

    public async openAuthorsForEdit(){
        await this.page.locator('//button/span[.="Edit"]').nth(2).click();
        await expect(this.page.getByText('Credit people who helped create the data.')).toBeVisible();
        await expect(this.addAuthorBtn).toBeVisible()

    }

    public async openProvenanceEdit(){
        await this.page.locator('//button/span[.="Edit"]').nth(4).click();
        await expect(this.page.getByText('Describe the source of the model.')).toBeVisible();
        await expect(this.page.getByPlaceholder('Let others know how you sourced the model')).toBeVisible()
    }

    public async changeModelDetails(text:string){
        await this.openModelDetailsForEdit();
        await this.modelDescriptionField.fill(text);
        await this.saveBtn.click()
    }   
    public async addModelAuthors(authorName:string, authorWebsite:string){
        await this.openAuthorsForEdit();
        await this.addAuthorBtn.click();
        await expect(this.authorNameField.last()).toBeVisible();
        await expect(this.authorNameField.last()).toHaveAttribute('required');
        await this.authorNameField.last().fill(authorName);
        await this.autorWebsiteField.last().fill(authorWebsite);
        await this.saveBtn.click()
    } 
}
import { Locator, expect} from "@playwright/test";
import { Header } from "./Header";

export class Models extends Header{
    newModelBtn: Locator
    urlEditBtn: Locator
    modelTitleFieldOnCreate: Locator
    modelURLField: Locator
    createModelBtn: Locator
    visibilityDropDown: Locator
    frameworkListOnCreate: Locator
    addNewVariationOnCreateBtn: Locator
    variationSlugInput: Locator
    licenseListOnCreate: Locator
    addTagsBtn: Locator
    editTagsBtn: Locator
    goToModelDetailBtn: Locator
    pencilEdit: Locator
    modelTitleFieldOnEdit: Locator
    modelSubtitleFieldOnEdit: Locator
    modelTitleFieldOnView: Locator
    modelSubTitleOnView: Locator
    modelDescriptionField: Locator
    modelVisibilityDropDown: Locator
    authorNameField: Locator
    autorWebsiteField: Locator
    addAuthorBtn: Locator
    modelAuthors: Locator
    addSubtitlePendingAction: Locator
    addTagsPendingAction: Locator
    saveBtn: Locator
    createBtn: Locator

    resetBtn: Locator
    trippleDotsBtn: Locator

    constructor(page){
        super(page)
        this.modelTitleFieldOnCreate = page.getByPlaceholder('Enter model title')
        this.urlEditBtn = page.locator('.drawer-outer-container').getByText('Edit')
        this.modelURLField = page.locator('input[placeholder=""]')
        this.visibilityDropDown = page.locator('button[role="combobox"]').first()
        this.createModelBtn = page.locator('//button[.="Create model"]') 
        this.frameworkListOnCreate = page.getByLabel('Select framework')
        this.addNewVariationOnCreateBtn = page.locator('button').getByText('addAdd new variation')
        this.variationSlugInput = page.getByPlaceholder('Enter model variation slug')
        this.licenseListOnCreate = page.getByText(/Select a license/)
        this.addTagsBtn = page.getByRole('button').filter({hasText:'Add Tags'})
        this.editTagsBtn = page.getByLabel('Edit Tags')
        this.goToModelDetailBtn = page.locator('.drawer-outer-container button').getByText('Go to model detail page')
        this.pencilEdit = page.getByLabel('edit',{exact:true})
        this.modelTitleFieldOnEdit = page.getByPlaceholder('Enter a title')
        this.modelSubtitleFieldOnEdit = page.locator('#site-content [maxlength="255"]')
        this.modelTitleFieldOnView = page.locator('#site-content h1')
        this.modelSubTitleOnView = page.locator('[wrap="hide"] span p').nth(1)
        this.modelDescriptionField = page.getByPlaceholder('Describe the source of the model.')
        this.modelVisibilityDropDown = page.locator('.mdc-layout-grid').getByRole('combobox').locator('span')
        this.addAuthorBtn = page.locator('//button/span[.="Add Author"]')
        this.authorNameField = page.getByLabel('textfield-Author Name-label').locator('input')
        this.autorWebsiteField = page.getByLabel('textfield-Website-label').locator('input')
        this.modelAuthors = page.locator('#site-content p a').all()
        this.addSubtitlePendingAction = page.getByTitle('Add a subtitle')
        this.addTagsPendingAction = page.getByTitle('Add tags')
        this.saveBtn = page.locator('button',{hasText:'Save'})
        this.createBtn = page.locator('.drawer-outer-container button').getByText('Create')
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
    
    public async fillModelTitleFieldOnCreate(name:string){
        await this.modelTitleFieldOnCreate.fill(name)
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
        await this.page.locator('li',{hasText:text+visibility}).click();
    }

    public async clickCreateModel(){
        await this.createModelBtn.click()
    }

    public async clickGoToModelDetailsBtn(){
        await expect.poll(async()=>{
            return await this.page.getByText('Files Processing...').isVisible()
        }).toBe(false)
        await this.goToModelDetailBtn.click()
    }

    public async selectFrameworkOnCreate(frameworkName:string){
        await this.frameworkListOnCreate.click();
        await this.page.locator('[role="listbox"] [role="menuitem"]',{hasText:frameworkName}).click()
    }
    public async saveModelAndGetIdAndSlug(){
        const responsePromise = this.page.waitForResponse('/api/i/models.ModelService/CreateModel', {
            timeout: 30000
        });
        await this.createModelBtn.click();
        const response = await (await responsePromise).json();
        return {id: response.id, ownerSlug: response.owner.slug}
    }
    public async clickAddNewVariationBtn(){
        await this.addNewVariationOnCreateBtn.click()
    }

    public async uploadVariationFile(path:string[]){
        await this.page.getByPlaceholder('Drag and drop image to upload').setInputFiles(path);
        await this.page.waitForResponse(response=>response.url().includes('kaggle-models-data/o?uploadType=resumable&upload_id')&&response.status()===200)
    }

    public async fillVariationSlugInput(variationSlug:string){
        await this.variationSlugInput.fill(variationSlug)
    }

    public async getVariationFutureURL(){
        await this.page.waitForTimeout(100)
        return this.page.locator('.mdc-text-field-helper-text').innerText()
    }

    public async selectLicenseOnVariationCreate(licenseName:string='Unknown'){
        await this.licenseListOnCreate.click();
        await this.page.locator('[role="listbox"] [role="menuitem"]',{hasText:licenseName}).click()
    }

    // public async getCreatedModelRequestPromise(){
    //     return this.page.waitForRequest(`${process.env.CREATE_MODEL_ENDPOINT}`);
    // }

    // public async getCreatedModelRequestParams(promise:any):Promise<{ ownerSlug: number}>{
    //     const request = await (await promise).postDataJSON();
    //     return {ownerSlug: request.ownerSlug}
    // }

    // public async getCreatedModelResponsePromise(){
    //     return this.page.waitForResponse(`${process.env.CREATE_MODEL_ENDPOINT}`);
    // }

    // public async getCreatedModelResponseParams(promise:any):Promise<{ modelId: number}>{
    //     const response = await promise;
    //     const responseBody  = await response.json()
    //     return { modelId: responseBody.id}
    // }

    public async getModelTitleOnView(){
        return this.modelTitleFieldOnView.innerText()
    }

    public async getModelVisibilitySettingOnView(){
        return this.modelVisibilityDropDown.innerText()
    }

    public async clickPencilEditBtn(){
        await this.pencilEdit.click()
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
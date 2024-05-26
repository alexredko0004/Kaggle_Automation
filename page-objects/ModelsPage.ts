import { Locator, expect} from "@playwright/test";
import { Header } from "./Header";

export class Models extends Header{
    newModelBtn: Locator
    urlEditBtn: Locator
    modelTitleFieldOnCreate: Locator
    modelURLField: Locator
    createModelBtn: Locator
    visibilityDropDown: Locator
    goToModelDetailBtn: Locator
    pencilEdit: Locator
    modelTitleFieldOnEdit: Locator
    modelSubtitleFieldOnEdit: Locator
    modelTitleFieldOnView: Locator
    modelDescriptionField: Locator
    authorNameField: Locator
    autorWebsiteField: Locator
    addAuthorBtn: Locator
    modelAuthors: Locator
    addSubtitlePendingAction: Locator
    saveBtn: Locator

    resetBtn: Locator
    trippleDotsBtn: Locator

    constructor(page){
        super(page)
        this.modelTitleFieldOnCreate = page.getByPlaceholder('Enter model title')
        this.urlEditBtn = page.locator('.drawer-outer-container').getByText('Edit')
        this.modelURLField = page.locator('input[placeholder=""]')
        this.visibilityDropDown = page.locator('button[role="combobox"]').first()
        this.createModelBtn = page.locator('//button[.="Create model"]') 
        this.goToModelDetailBtn = page.locator('.drawer-outer-container button').getByText('Go to model detail page')
        this.pencilEdit = page.getByLabel('edit',{exact:true})
        this.modelTitleFieldOnEdit = page.getByPlaceholder('Enter a title')
        this.modelSubtitleFieldOnEdit = page.locator('#site-content [maxlength="255"]')
        this.modelTitleFieldOnView = page.locator('#site-content h1')
        this.modelDescriptionField = page.getByPlaceholder('Describe the source of the model.')
        this.addAuthorBtn = page.locator('//button/span[.="Add Author"]')
        this.authorNameField = page.getByLabel('textfield-Author Name-label').locator('input')
        this.autorWebsiteField = page.getByLabel('textfield-Website-label').locator('input')
        this.modelAuthors = page.locator('#site-content p a').all()
        this.addSubtitlePendingAction = page.getByTitle('Add a subtitle')
        this.saveBtn = page.locator('button',{hasText:'Save'})
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
        await this.modelTitleFieldOnCreate.fill(name);
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
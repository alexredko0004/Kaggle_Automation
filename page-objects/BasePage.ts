import {Page, Locator} from '@playwright/test'

export abstract class BasePage{
    page: Page
    confirmationDialog: Locator
    flashMessage: Locator
    tooltip: Locator

    constructor(page){
        this.page = page
        this.confirmationDialog = page.getByRole('dialog')
        this.flashMessage = page.getByRole('presentation').getByRole('alert')
        this.tooltip = page.getByRole('tooltip').locator('.MuiTooltip-tooltip')
    }
    
    public async clickBtnOnConfirmationDialog(btnName:string){
        await this.confirmationDialog.locator('button',{has:this.page.getByText(btnName)}).click()
    }
    
    public async acceptCookies(){
        if (await this.page.getByText('OK, Got it.').isVisible()) await this.page.getByText('OK, Got it.').click()
    }

    public async getConfirmationPopupHeaderInnerText(){
        const innerText = await this.confirmationDialog.locator('h2').innerText();
        return innerText
    }

    public async getConfirmationPopupInnerText(){
        const innerText = await this.confirmationDialog.locator('//h2/following-sibling::div/p').innerText();
        return innerText
    }

    public getFlashMessageLocator():Locator{   
        return this.flashMessage
    }

    public async getFlashMessageText(){
        await this.flashMessage.isVisible();
        return this.flashMessage.innerText()
    }

    public getLocatorByText(text:string):Locator{
        return this.page.getByText(text)
    }

    public async getPageURLAfterRedirect(){
        await this.page.waitForTimeout(500);
        const url = this.page.url();
        return url
    }

    public getTooltipLocator():Locator{
        return this.tooltip
    }

    public async getTooltipText(){
        await this.tooltip.isVisible();
        return this.tooltip.locator('p').innerText()
    }

    public async isConfirmationPopupShown(){
        return await this.confirmationDialog.isVisible()
    }
    
    public async selectFilesForUpload(filePaths:string[]){
        await this.page.getByPlaceholder('Drag and drop image to upload').setInputFiles(filePaths);
    }
    

    public async reloadPage(){
        await this.page.reload()
    }
}
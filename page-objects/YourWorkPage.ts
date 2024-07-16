import { Locator, expect} from "@playwright/test";
import { BaseBusinessObjectPage } from "./BaseBusinessObjectPage";

export class YourWork extends BaseBusinessObjectPage{
    agreementCheckbox: Locator
    cancelBtnOnConfirmDialog: Locator
    continueBtnOnPanel: Locator
    deleteBtn: Locator
    deleteBtnOnConfirmDialog: Locator
    itemOnConfirmationDialog: Locator
    listItem: Locator
    searchField: Locator
    

    constructor(page){
        super(page)
        this.agreementCheckbox = page.locator('.drawer-outer-container input')
        this.cancelBtnOnConfirmDialog = page.locator('.drawer-outer-container button').getByText('Cancel')
        this.continueBtnOnPanel = page.locator('.drawer-outer-container button').getByText('Continue')
        this.deleteBtn = page.getByTitle('Delete selected items')
        this.deleteBtnOnConfirmDialog = page.getByRole('dialog').getByRole('button').getByText('Delete')
        this.listItem = page.locator('#site-content ul li')
        this.itemOnConfirmationDialog = page.locator('.drawer-outer-container ul li a')
        this.searchField = page.getByPlaceholder('Search Your Work')
    }
    
    public async checkAgreementCheckbox(){
        await this.agreementCheckbox.check()
    }


    public async checkAllItemsContainingNameAndReturnTheirNames(name:string){
        await this.page.waitForTimeout(7000);
        await this.page.reload();
        await this.page.waitForTimeout(1000);
        const items = await this.listItem.filter({hasText:`${name}`}).all();
        let checkedItemsNames:Array<string|null> = []
        for(let title of items){
            await title.locator('[type="checkbox"]').check();
            checkedItemsNames.push(await title.locator('a').first().getAttribute('aria-label'))
        }
        return checkedItemsNames
    }

    public async clickContinueBtnOnPanel(){
        await this.continueBtnOnPanel.click()
    }

    public async clickCancelBtnOnConfirmDialog(){
        await this.cancelBtnOnConfirmDialog.click()
    }

    public async clickDeleteBtn(){
        await this.deleteBtn.click()
    }

    public async clickDeleteBtnOnConfirmDialog(){
        await this.deleteBtnOnConfirmDialog.click()
    }

    /**
     * 
     * @param itemName - can be model title or subtitle
     */
    public async clickListItem(itemName:string){
        await this.listItem.filter({hasText:itemName}).click()
    }

    public async getCheckedItemsNames(){
        const items = await this.listItem.filter({has:this.page.getByTestId('CheckBoxIcon')}).all();
        let checkedItemsNames: Array<string|null> = []
        for (let item of items){
            checkedItemsNames.push(await item.locator('a').first().getAttribute('aria-label'))
        }
        return checkedItemsNames
    }

    public async getCountOfItemsOnDeleteWarningPanel(){
        const stringOnPanel = await this.page.locator('.drawer-outer-container p').first().innerText();
        const stringArray = stringOnPanel.split(' ');
        return parseInt(stringArray[8])
    }

    public async getNamesOfItemsOnDeleteWarningPanel(){
        const arrayOfLocators = await this.itemOnConfirmationDialog.all();
        let arrayOfNames:Array<string|null> = []
        for (let locator of arrayOfLocators){
            arrayOfNames.push(await locator.getAttribute('aria-label'))
        }
        return arrayOfNames
    }

    public async getListItemByNameOrSubtitle(itemNameOrSubtitle:string){
        await this.page.waitForTimeout(500)
        return this.listItem.filter({hasText:itemNameOrSubtitle})
    }

    public async getListItemSubtitle(listItem:Locator){
        await this.page.waitForTimeout(500)
        return await listItem.locator('a span').first().innerText()
    }

    public async getListItemDetailsModel(listItem:Locator): Promise<{ visibility: string, owner: string, countVariations: string, countNotebooks: string}>{
        await this.page.waitForTimeout(500);
        const details = await listItem.locator('a span').nth(1).allInnerTexts();
        const detailsArray = details[0].split(' · ');
        detailsArray[0]!=='Private'?detailsArray.unshift('Public'):detailsArray
        return {visibility: detailsArray[0], owner: detailsArray[1], countVariations: detailsArray[2], countNotebooks: detailsArray[3]}
    }

    public async searchYourWork(searchString:string){
        await this.page.waitForTimeout(500)
        await this.searchField.fill(searchString)
    }

    public async uncheckItemsWithProvidedNamesAndReturnTheirNames(names:string[]){
        let itemsToUncheck:Array<Locator> = []
        for(let name of names){
            itemsToUncheck.push(this.listItem.filter({hasText:`${name}`}));
        }
        let uncheckedItemsNames:Array<string|null> = []
        for(let item of itemsToUncheck){
            await item.locator('[type="checkbox"]').uncheck();
            uncheckedItemsNames.push(await item.locator('a').first().getAttribute('aria-label'))
        }
        return uncheckedItemsNames
    }
}
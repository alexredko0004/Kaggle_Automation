import { Page } from "@playwright/test";
import { MainMenu } from "./MainMenu";
import { BasePage } from "./BasePage";
import { Dataset } from "./test-data/dataset";

export class PageManager extends BasePage{
    private readonly mainMenu: MainMenu
    private readonly dataSet: Dataset
    
    constructor(page:Page){
        super(page)
        this.mainMenu = new MainMenu(this.page);
        this.dataSet = new Dataset(this.page)
    }

    navigateTo(){
        return this.mainMenu
    }

    onDatasetsPage(){
        return this.dataSet
    }

    // onDatepickerPage(){
    //     return this.datepickerPage
    // }
}
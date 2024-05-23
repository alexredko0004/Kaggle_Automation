const date = new Date()
export const currentYear = function(){
    return ''+date.getFullYear();
}

export const currentMonth = function(){
    if (date.getMonth()<9){
    return '0'+(date.getMonth()+1)}
    else return ''+(date.getMonth()+1)
}

export const currentDate = function(){
    if (date.getDate()<10){
    return '0'+(date.getDate())}
    else return ''+(date.getDate())
}
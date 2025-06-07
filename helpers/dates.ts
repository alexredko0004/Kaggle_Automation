let date = new Date()
let date1 = new Date()
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

export const getRandomPastDate = function (){
    const randomPastYear = date.getFullYear()-(Math.floor(Math.random() * 100));
    const randomPastMonth = date.getMonth()-(Math.floor(Math.random() * 12));
    const randomPastDay = date.getDate()-(Math.floor(Math.random() * 31));
    date.setFullYear(randomPastYear);
    date.setMonth(randomPastMonth);
    date.setDate(randomPastDay);
    return {
        DD_Mon_YYYYformat: `${date.getDate()} ${date.toLocaleString('En-US',{month:'short'})} ${date.getFullYear()}`,
        MM_DD_YYYYformat: `${date.toLocaleString('En-US',{month:'2-digit'})}/${date.getDate()<10?'0'+date.getDate():date.getDate()}/${date.getFullYear()}`
    }
}

export const getRandomFutureDate = function (){
    const randomFutureYear = date1.getFullYear()+(Math.floor(Math.random() * 50));
    const randomFutureMonth = date1.getMonth()+(Math.floor(Math.random() * 12));
    const randomFutureDay = date1.getDate()+(Math.floor(Math.random() * 31));
    date1.setFullYear(randomFutureYear);
    date1.setMonth(randomFutureMonth);
    date1.setDate(randomFutureDay);
    return {
        DD_Mon_YYYYformat: `${date1.getDate()} ${date1.toLocaleString('En-US',{month:'short'})} ${date1.getFullYear()}`,
        MM_DD_YYYYformat: `${date1.toLocaleString('En-US',{month:'2-digit'})}/${date1.getDate()<10?'0'+date1.getDate():date1.getDate()}/${date1.getFullYear()}`
    }
}
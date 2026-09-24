export function randomCode(){

    const word = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

    let random=''

    for(let index = 0; index <6; index++) {
        random+= word[Math.floor(Math.random()*word.length)];     
    }
    return random
    

}

// console.log(randomCode());




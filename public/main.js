let inputs = document.querySelectorAll('.inputs');
let label = document.querySelectorAll('.label');


for(let i = 0; i < inputs.length; i++){
    inputs[i].addEventListener('keyup',()=>{
        if(inputs[i].value.length > 0){
            label[i].classList.add('transInput');
            label[i].classList.add('input:valid~label');
        }else{
            label[i].classList.remove('transInput');
            label[i].classList.remove('input:valid~label');
        }  
    })
}

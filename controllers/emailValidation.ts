const request = require('request-promise');

export default class EmailValidation {
    chackEmail = (email) => {
        return new Promise((resolve)=>{
            if(process.env.MODE==='dev'){
                resolve(200)
            }else {
                const option = {
                    method: 'GET',
                    uri: `https://www.validator.pizza/email/${email}`,
                    json: true
                };
                request(option).then(res=>{
                    console.log('__________',res);
                    resolve(res.status)
                })

            }
        })

    };
}
//
// const emailValidation=new EmailValidation()
//
// emailValidation.chackEmail(req.body.email).then(mail=>{
//     if(mail===200){
//
//     }else{
//         resp.isSuccessful =false;
//         resp.message = 'Email is invalid'
//
//         return res.json(resp);
//
//     }
// })

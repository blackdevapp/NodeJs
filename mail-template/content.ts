export default class Content {

  agencyRegistration = (associated_agency, role,btnUrl?:string) => {
    let template = `
      <tr>
         <td class="esd-block-text es-m-txt-c es-p15t" align="center">
         <p>Registration</p>
            <p>Administration of agency ${associated_agency} has chosen you as ${role}.
            Use below link to go to password initiation process and start using your panel. </p>
         </td>
      </tr>
      ${btnUrl?this.generateBtn(btnUrl,'Change Password'):null}`;
    return template;


  };
  userRegistration = (email,associated_agency,btnUrl) => {
      console.log(213213123,this.generateBtn(btnUrl,'Login'));
       let template = `
      <tr>
         <td class="esd-block-text es-m-txt-c es-p15t" align="center">
         <p>Registration</p>
            <p>Thank you ${email} for registering in ${associated_agency}, Please use below code in your panel to finalise registration process.</p>
         </td>
      </tr>
      ${btnUrl?this.generateBtn(btnUrl,'Login'):null}`;
    return template;

  }

  agencyInsert = (agency_id) => {
   let btnUrl   = `${process.env.BASE_URL_CLIENT}signup?refferalCode=${agency_id}`,
       template = `
         <tr>
            <td class="esd-block-text es-m-txt-c es-p15t" align="center">
               <p>This would be always an honor to onboard a new agency in our world of journeys. You may now use all features of Next Journey by using below code, or by simply clicking on it's link.</p>
               <p>Agency Code : ${agency_id}</p>
            </td>
         </tr>
         ${this.generateBtn(btnUrl,'Onboard Now!')}`;
    return template;

  }
  inqueryInsert = (firstName,lastName,type,request) => {
   let btnUrl   = `${process.env.BASE_URL_CLIENT}panel/inqueries`,
       template = `
         <tr>
            <td class="esd-block-text es-m-txt-c es-p15t" align="center">
               <p>Hello ${firstName} ${lastName}</p>
               <p>Your ${type==='BOOK'?'Booking':'Visa Process'} for ${request} is now under process by respective agency. Another email will get sent to you once the status of your booking has been changed.
            </td>
         </tr>
         ${this.generateBtn(btnUrl,'Check Status Now')}`;
    return template;

  }
  updateInquery = (firstName,lastName,type,request,status) => {
   let btnUrl   = `${process.env.BASE_URL_CLIENT}panel/inqueries`,
       template = `
         <tr>
            <td class="esd-block-text es-m-txt-c es-p15t" align="center">
               <p>Hello ${firstName} ${lastName}</p>
               <p>Your ${type==='BOOK'?'Booking':'Visa Process'} for ${request} is changed to <b style="color:${status=='APPROVED'?'green':'yellow'};">${status}</b> by respective agency..
            </td>
         </tr>
         ${this.generateBtn(btnUrl,'Check Status Now')}
         `,
      tempWBtn = `
         <tr style="border-collapse:collapse;"> 
            <td class="es-m-txt-c" align="center" style="padding:0;Margin:0;padding-top:15px;"> <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;">${template}</p> </td> 
         </tr> `;
      return template;
  }
  deleteInquery = (firstName,lastName,type,request) => {
       let template = `
         <tr>
            <td class="esd-block-text es-m-txt-c es-p15t" align="center">
               <p>Hello ${firstName} ${lastName}</p>
               <p>Your ${type==='BOOK'?'Booking':'Visa Process'} for ${request} was <b style="color:red;">Deleted</b> by admin 
            </td>
         </tr>
         `
      return template;
  }



  changePass = (user,token,url) => {
   let btnUrl   = `${process.env.BASE_URL_CLIENT}${url}?token=${token}`,
    template = `
      <tr>
         <td class="esd-block-text es-m-txt-c es-p15t" align="center">
            <p>Hello ${user.firstName? user.firstName : user.email}</p>
            <p>You have recently requested for password change. Change your password in your panel by clicking on following link</p>
         </td>
      </tr>
      ${this.generateBtn(btnUrl,'Go To Panel')}`;
    return template;

  }
  registerWithFacebook = (email,password,token,url) => {
   let btnUrl   = `${process.env.BASE_URL_CLIENT}${url}?token=${token}`,
    template = `
      <tr>
         <td class="esd-block-text es-m-txt-c es-p15t" align="center">
            <p>Hello ${email}</p>
            <p>You are register with your facebook account. we signup you automatically on nj</p>
            <p>your account information for login is:</p>
            <p>username:${email}</p>
            <p>password:${password}</p>
         </td>
      </tr>
      ${this.generateBtn(btnUrl,'Change Password')}`;
    return template;

  }
  successChangePass = (email) => {
    let template = `
      <tr>
         <td class="esd-block-text es-m-txt-c es-p15t" align="center">
            <p>Hello ${email}</p>
            <p>your password has successfully updated!</p>
         </td>
      </tr>`;
    return template;
  }
  generateBtn =  (url,label) =>{
   let btn = `
   <tr style="border-collapse:collapse;"> 
      <td align="center" style="Margin:0;padding-left:10px;padding-right:10px;padding-bottom:15px;padding-top:20px;"> <span class="es-button-border" style="text-decoration: none!important;font-family: helvetica,'helvetica neue',arial,verdana,sans-serif;font-size: 16px;color: #efefef;border-style: solid;border-color: #474745;border-width: 6px 25px 6px 25px;display: inline-block;background: #474745;border-radius: 4px;font-weight: normal;font-style: normal;line-height: 19px;width: auto;text-align: center;padding-top: 7px;padding-bottom: 7px;"> <a href="${url}" class="es-button" target="_blank" style="mso-style-priority:100 !important;text-decoration:none !important;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;font-size:16px;color:#EFEFEF;border-style:solid;border-color:#474745;border-width:6px 25px 6px 25px;display:inline-block;background:#474745;border-radius:20px;font-weight:normal;font-style:normal;line-height:19px;width:auto;text-align:center;">${label}</a> </span> </td> 
   </tr> `
   return btn;
  }


  registerWithReturnUrl = (email,returnUrl,token) => {
    let template = `
 <tr>
    <td class="esd-block-text es-m-txt-c es-p15t" align="center">
        <p>Hello ${email}</p>
        <a href="${process.env.BASE_URL_CLIENT}${returnUrl}?token=${token}">Go To Booking</a>
    </td>
 </tr>`;
    return template;

  }
  registerWithoutReturnUrl = (email,token) => {
    let template = `
 <tr>
    <td class="esd-block-text es-m-txt-c es-p15t" align="center">
        <p>Hello ${email}</p>
        ${this.generateBtn(process.env.BASE_URL_CLIENT+'login?token='+token,'Login')}
    </td>
 </tr>`;
    return template;

  }
}

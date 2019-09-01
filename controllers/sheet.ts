var GoogleSpreadsheet = require('google-spreadsheet');
var async = require('async');
export default class Sheet {

  makeSheet=(req,res)=>{
    var doc = new GoogleSpreadsheet('1dXsTr_CNLruZoKP08q0tkiY3KJkIqtIFP36_FQmRMnI');

    // doc.useServiceAccountAuth();
    this.managingSheets();
  }

  setAuth(step) {
    var doc = new GoogleSpreadsheet('<spreadsheet key>');
    var sheet;
    // see notes below for authentication instructions!
    var creds = {"client_id":"948305690058-pjfkncbl7h1ce85tt08jf8epjuma7ers.apps.googleusercontent.com","project_id":"quickstart-1548757729198","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_secret":"YgLdTwW7dSCjuLKSHSXyRhl5","redirect_uris":["urn:ietf:wg:oauth:2.0:oob","http://localhost"]};
    // OR, if you cannot save the file locally (like on heroku)
    var creds_json = {
      client_email: 'yourserviceaccountemailhere@google.com',
      private_key: 'your long private key stuff here'
    }

    doc.useServiceAccountAuth(creds, step);
  }
  getInfoAndWorksheets(step) {
    var doc = new GoogleSpreadsheet('<spreadsheet key>');
    var sheet;
    doc.getInfo(function(err, info) {
      console.log('Loaded doc: '+info.title+' by '+info.author.email);
      sheet = info.worksheets[0];
      console.log('sheet 1: '+sheet.title+' '+sheet.rowCount+'x'+sheet.colCount);
      step();
    });
  }
  workingWithRows(step) {
    var doc = new GoogleSpreadsheet('<spreadsheet key>');
    var sheet;
    // google provides some query options
    sheet.getRows({
      offset: 1,
      limit: 20,
      orderby: 'col2'
    }, function( err, rows ){
      console.log('Read '+rows.length+' rows');

      // the row is an object with keys set by the column headers
      rows[0].colname = 'new val';
      rows[0].save(); // this is async

      // deleting a row
      rows[0].del();  // this is async

      step();
    });
  }
  workingWithCells(step) {
    var doc = new GoogleSpreadsheet('<spreadsheet key>');
    var sheet;
    sheet.getCells({
      'min-row': 1,
      'max-row': 5,
      'return-empty': true
    }, function(err, cells) {
      var cell = cells[0];
      console.log('Cell R'+cell.row+'C'+cell.col+' = '+cell.value);

      // cells have a value, numericValue, and formula
      cell.value == '1'
      cell.numericValue == 1;
      cell.formula == '=ROW()';

      // updating `value` is "smart" and generally handles things for you
      cell.value = 123;
      cell.value = '=A1+B2'
      cell.save(); //async

      // bulk updates make it easy to update many cells at once
      cells[0].value = 1;
      cells[1].value = 2;
      cells[2].formula = '=A1+B1';
      sheet.bulkUpdateCells(cells); //async

      step();
    });
  }
  managingSheets() {
    var doc = new GoogleSpreadsheet('17SwjbO_7ylFll2hT2Z2rTxv6XnkAJzsA7pqfSIXp3AU');
    // doc.addWorksheet({
    //   title: 'my new sheet'
    // }, function(err, sheet) {
    //   console.log(err);
    //   console.log(sheet);
    //   // change a sheet's title
    //   // sheet.setTitle('new title'); //async
    //
    //   //resize a sheet
    //   sheet.resize({rowCount: 50, colCount: 20}); //async
    //
    //   sheet.setHeaderRow(['name', 'age', 'phone']); //async
    //
    //   // removing a worksheet
    //   sheet.del(); //async
    //
    // });
    var sheet;
    async.series([
      function setAuth(step) {
        // see notes below for authentication instructions!
        var creds = {
          "private_key_id": "f030202be092ae8daabbeab9ca0431d28923b54f",
          "private_key": "-----BEGIN PRIVATE KEY-----\nMIICeAIBADANBgkqhkiG9w0BAQEFAASCAmIwggJeAgEAAoGBAMgEXVtFl1zdYTU6\nmdt0Lm1am3jXTWlJutJTdltLN7vLxxzmtSgPfmz6FatPiIiz5kX0l38oMD67v55Y\nDrHqKRYaWUaMnkiEzxx3NcpdEvvN667ZhPI3hF+ZnG5Iao8VxyrXCw9YPxGdHTMf\nQaS/zMla6bhHN9efkJGVzcv4SINDAgMBAAECgYEAl96AiAnKCO/qnED3i6Kmkc+H\nVvSbSYN6/7HxnxX4pnXupGokSNui0dn9VAraj3mRMbKqyRjZsPhbYT5ZQguaz12i\nhjQpYWubJmh10vxGq1wax7IZ4ZeCeU2ges/iXoVjqjbWmRTikohYSq0/09Mbr5oj\nMWhpjIjOKk5qzzIAs6kCQQD2j6EQsIYbiZZ3a1mxu5ii8uXU7nOloVfSLsRV5PRq\nUZ8Mh/kVxfWHB/86keT4aA6dvkymRUsnT7ii9k+/KAOPAkEAz6yXMayB8HP78jKU\nbHdH01U+rjO66fY/E+S/o+Vri+quHkrt02nWonwZfQ0g06fSUUiPzWbvYLk3AmIJ\nRfvbDQJBAKQZH9edxQPa5LwCRKYX9xSsmO7I7UtVQL/wxFdulIWWYUbT0KH/KNSA\nLAxtQXlauC+gkh8viz9UvcwoJxdQqF0CQGF91mSdZUqqSEaE9CSPQoq1Y/2Hj2Gy\nFh6SrlyUoQ5IF4FlD4zGDNqug5CvDxANorBB7jAw+INhr69QsqXF/CkCQQCM1EEi\nltkaVZDlv39rmEw/B0FKNRXaAOZyq/iJdyJW/PxlEhz7HqZJ/PBsVax7ubdmtPIu\neE5spHLIs9lF3CMJ\n-----END PRIVATE KEY-----\n",
          "client_email": "948305690058-pjfkncbl7h1ce85tt08jf8epjuma7ers.apps.googleusercontent.com",
          "client_id": "948305690058-pjfkncbl7h1ce85tt08jf8epjuma7ers.apps.googleusercontent.com"
        };
        // OR, if you cannot save the file locally (like on heroku)
        // var creds_json = {
        //   client_email: 'yourserviceaccountemailhere@google.com',
        //   private_key: 'your long private key stuff here'
        // }

        doc.useServiceAccountAuth(creds, step);
      },
      function getInfoAndWorksheets(step) {
        doc.getInfo(function(err, info) {
          console.log('Loaded doc: '+info.title+' by '+info.author.email);
          sheet = info.worksheets[0];
          console.log('sheet 1: '+sheet.title+' '+sheet.rowCount+'x'+sheet.colCount);
          step();
        });
      },
      function workingWithRows(step) {
        // google provides some query options
        sheet.getRows({
          offset: 1,
          limit: 20,
          orderby: 'col2'
        }, function( err, rows ){
          console.log('Read '+rows.length+' rows');

          // the row is an object with keys set by the column headers
          rows[0].colname = 'new val';
          rows[0].save(); // this is async

          // deleting a row
          rows[0].del();  // this is async

          step();
        });
      },
      function workingWithCells(step) {
        sheet.getCells({
          'min-row': 1,
          'max-row': 5,
          'return-empty': true
        }, function(err, cells) {
          var cell = cells[0];
          console.log('Cell R'+cell.row+'C'+cell.col+' = '+cell.value);

          // cells have a value, numericValue, and formula
          cell.value == '1'
          cell.numericValue == 1;
          cell.formula == '=ROW()';

          // updating `value` is "smart" and generally handles things for you
          cell.value = 123;
          cell.value = '=A1+B2'
          cell.save(); //async

          // bulk updates make it easy to update many cells at once
          cells[0].value = 1;
          cells[1].value = 2;
          cells[2].formula = '=A1+B1';
          sheet.bulkUpdateCells(cells); //async

          step();
        });
      },
      function managingSheets(step) {
        doc.addWorksheet({
          title: 'my new sheet'
        }, function(err, sheet) {

          // change a sheet's title
          sheet.setTitle('new title'); //async

          //resize a sheet
          sheet.resize({rowCount: 50, colCount: 20}); //async

          sheet.setHeaderRow(['name', 'age', 'phone']); //async

          // removing a worksheet
          sheet.del(); //async

          step();
        });
      }
    ], function(err){
      if( err ) {
        console.log('Error: '+err);
      }
    });
  }
}

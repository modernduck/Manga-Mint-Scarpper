var fs = require('fs');
var exec = require('child_process').exec;
var request = require('request');
var cheerio = require('cheerio');
var http = require('http')

console.log('start app')

var getDataFromMangamintCurrentPage = (url) => {
    return new Promise( (resolve, reject) => {
        request(url, function(error, response, html){
        if(!error)
            var $ = cheerio.load(html);
        else    
            reject(error)
        //console.log($)
        var img
        var nextUrl;
        var maxPage = -1;
        $('#manga_page option').filter( item => {
            //console.log("=>" + item)
            maxPage = Math.max(item, maxPage)
        })

        $('#images img').filter(function(){
                console.log('here is picture')
            var data = $(this);
            img = data['0'].attribs.src;
            
           

        });

        $('#images a').filter(function(){
             var data = $(this);
             //console.log(data['0'])
             nextUrl = data['0'].attribs.href
        });

         resolve({
            img:img,
            nextUrl:nextUrl,
            maxPage:maxPage
        })

    });

    } )

}

var downloadUrlToFile = (url, file_name) => {
    return new Promise( (resolve, reject) => {
       /* var file = fs.createWriteStream(file_name);
        var request = http.get(url, resp => {
            resolve(resp.pipe(file))
        })*/
        //detemine the extenstion
        var extend = ''
        var split =  url.split('.')
        if(split.length > 0)        
            extend = split[split.length -1 ]
        console.log('got file_name:' + file_name)
        cmd = "wget " + url + " -O " + file_name + "." + extend
        console.log(cmd)
        exec(cmd, function(error, stdout, stderr) {
        // command output is in stdout
            resolve(stdout)
        });
    } )
}

var createFolderForPath  = path => {
    return new Promise( (resolve, reject) =>{
        cmd = "mkdir " + path
        console.log(cmd)
        exec(cmd, function(error, stdout, stderr) {
        // command output is in stdout
        console.log('done')
            resolve(stdout)
        });
    })
    
}


var currentPage = -1;
var PAGE_STATUS = {
    DONE:0,
    LOADING:1
}
var current_page_status = PAGE_STATUS.DONE
var downloadImgFromPage = (page, path) =>{
    return new Promise( (resolve, reject) =>{
        current_page_status = PAGE_STATUS.LOADING
        getDataFromMangamintCurrentPage(page).then( data =>{
            console.log('going to save files to ' + path)
            console.log( path  + "/" + (currentPage + 1))
            downloadUrlToFile(data.img, path  + "/" + (currentPage + 1) )
            console.log('next go to ')
            console.log(data.maxPage)
            console.log(page)
            currentPage++;
            if(currentPage < data.maxPage )
                resolve(downloadImgFromPage(firstPageUrl + data.nextUrl, path))
            else{
                console.log('done load page')
                currentPage = -1
                current_page_status = PAGE_STATUS.DONE
                resolve(current_page_status)
            }
            
        })
    })
    
}

var downloadAllChapter = () =>{
     createFolderForPath(manga_key_name + "/" + current_load_chapter).then(()=>{
      downloadImgFromPage(firstPageUrl, manga_key_name + "/" + current_load_chapter).then(()=>{
          console.log('--------------LOADING CHAPTER' + current_load_chapter + ' -----------')
          current_load_chapter++;
           firstPageUrl = main_url + manga_key_name + '-' + current_load_chapter
          if(current_load_chapter < chapter_max)
            downloadAllChapter()
        else    
            console.log('complete')
      })
    })
}

//actual code run
var main_url = "http://www.mangamint.com/"
var chapter_max = 80
var chapter_start = 1; 
var current_load_chapter = 1
var manga_key_name = "black-clover"
var firstPageUrl = main_url + manga_key_name + '-' + current_load_chapter



createFolderForPath(manga_key_name).then(()=>{
   downloadAllChapter()

})


//downloadImgFromPage(firstPageUrl)
 

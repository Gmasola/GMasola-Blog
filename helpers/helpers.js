function pagination (currentPage, nElements, nElementForPage, nShowedPages){
    var firstPage = 1;
    var previusPage = currentPage-1
   
    var currentPage = currentPage //1
    var start = currentPage - (nShowedPages /2)  // 1- 2.5  -1.5  -0.5  0.5  1.5
    var end =  currentPage + (nShowedPages /2)  // 1+ 2.5    3.5  4.5   5.5  6.5 
    var nextPage = currentPage+1
    var lastPage = Math.ceil( nElements/ nElementForPage)

    if (lastPage <= end){
      end = lastPage
    }

    
    if(start < 0){
        end = Math.abs(start)  + end
        start = 1
    }
    else{
      end = Math.floor(end)
      start = Math.floor(start)
    }

    var pages= [];
    for (var i=start; i <= end; i++){
      if (i != 0 && i <=  lastPage){ 
        pages.push(i)
      }
    }
    

   
    
    
    return {firstPage, previusPage, currentPage, pages, nextPage, lastPage}
}

module.exports.pagination = pagination;
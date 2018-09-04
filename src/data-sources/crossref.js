import {eventResponse,triggerEvent,addPaper,addEdge,merge} from 'core'
import {printTable} from 'ui/visualisations/table-view' 

eventResponse(true,'newSeed',async function(paper){
            
    if(paper.crossref!='Complete'){
        await paper.crossref
        paper.crossref = 'Complete'
        triggerEvent('seedUpdate',paper);
    }
    if(paper.references){

        let newpapers = paper.references.map(parseReference)

        getMetadata(newpapers)

        console.log('CrossRef found ' + paper.references.length + " citations")
        triggerEvent('newEdges')
    }
})

/* eventResponse(true,'newPaper',function(paper){
    if(paper.doi){
        console.log("querying crossRef for " +paper.doi)
        let url = `https://api.crossref.org/works/${paper.doi}`
        paper.crossref = fetch(url).then((resp)=>resp.json()).then(json=>{
            console.log("CrossRef data found for "+paper.doi)
            paper.crossref = 'Complete'
            merge(paper,parsePaper(json.message))
            triggerEvent('paperUpdate')
        })   
    };  
}) */

export function getMetadata(papers){

    let query = papers.filter((p)=>p.doi).map((p)=>`doi:${p.doi}`).join()
    let base = 'https://api.crossref.org/works?rows=1000&filter='
    fetch(base+query).then((resp)=>resp.json()).then(json=>{
        //json.message.items.forEach()
    })

}

export function titleSearch(input){

    let query = input.replace(' ','+')
    let url = `https://api.crossref.org/works?query.title=${query}`
    fetch(url).then((resp)=>resp.json()).then(json=>{
        
        const items = json.message.items.map(a=>{
            return {
                doi: a.DOI,
                title: a.title[0],
                author: a.author ? a.author[0].family : 'n.a',
                month: a.created['date-parts'][0][1],
                year: a.created['date-parts'][0][0],
                timestamp: a.created.timestamp,
                journal: a['container-title'] ? a['container-title'][0] : 'n.a'
            }
        })
        printTable('#title-search-table',items)

    })
}

function parsePaper(response){
    return {
            doi: response.DOI,
            title: response.title[0],
            author: response.author[0].family,
            month: response.created['date-parts'][0][1],
            year: response.created['date-parts'][0][0],
            timestamp: response.created.timestamp,
            journal: response['container-title'][0],
            citationCount: response['is-referenced-by-count'],
            references: response['reference'] ? response['reference'] : false,
            crossref: true
        };
}

function parseReference(ref){
    return {
        doi: ref.DOI ? ref.DOI : null,
        title: ref['article-title'] ? ref['article-title'] : 'unavailable',
        author: ref.author ? ref.author : null,
        year: ref.year ? ref.year : null ,
        journal: ref['journal-title'] ? ref['journal-title'] : null,
    }

}

function parseResponse(response){
            
    let ne = 0; //For bean counting only
    let citer = parsePaper(response);
    citer = addPaper(citer,true);
    if(!citer.references){return(citer)};
    let refs = citer.references;

    for(let i=0;i<refs.length;i++){
        let cited = parseReference(refs[i]);
        cited = addPaper(cited);
        addEdge({
            source: citer,
            target: cited,
            crossref: true,
            hide: false
        });
        ne++;//bean counting
    };   
    console.log('CrossRef found ' + ne + " citations")
    return(citer)
}
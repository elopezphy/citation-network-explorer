function printTable(tableID,items){

    d3.select(tableID).select('tbody').selectAll('tr').remove()

    var row = d3.select(tableID).select('tbody').selectAll('tr').data(items).enter()
                .append('tr')
                .classed('table-item',true)

    row.append('td')
        .classed('table-cell table-check',true)
        .append('input')
        .classed('item-select',true)
        .attr('type','checkbox')
        .data(items)                    

    row.append('td')
        .text(item=>item.title || 'n.a')
        .classed('table-cell table-title',true)
        
    row.append('td')
        .text(item=> item.author)
        .classed('table-cell table-author',true)

    row.append('td')
        .text(item=> item.year)
        .classed('table-cell table-year',true)
    
    row.append('td')
        .text(item=>item.journal)
        .classed('table-cell table-journal',true)
}
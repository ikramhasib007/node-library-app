var socket = io();

socket.on('connect', function() {
    console.log('connected to server');

});

if(jQuery('.table').length !== 0) {
    socket.on('bookList', function(books) {
        if(!books || !books.length) {
            jQuery(".table > tbody").html('<tr class="text-center"><td colspan="4">Book not found</td><tr>');
            return false;
        }
        var content = '';
        books.forEach(function(book){
            content += '<tr>';
            content += '<td>'+book.title+'</td>';
            content += '<td>'+book.author+'</td>';
            if(book.status === 'available') {
                content += '<td><span class="badge badge-success">'+book.status+'</span></td>';
            } else {
                content += '<td><span class="badge badge-danger">'+book.status+'</span></td>';
            }
            content += '<td><a href="/book/borrow/'+book._id+'">Borrow</a></td>';
            content += '</tr>';
        });
        jQuery(".table > tbody").html(content);
    });
}

socket.on('newUser', function(greetings) {
    var h1 = jQuery("<h1></h1>");
    h1.text(greetings.text);
    jQuery('#home').html(h1);
});

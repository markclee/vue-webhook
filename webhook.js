let http = require('http')
let server = http.createServer(function(req, res){
    if(req.method == 'POST' && req.url == '/webhook'){
        // https://121.36.36.62:4000/webhook 向这个地址发送post请求
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ok: true})) // 告诉github服务器, 成功了
    } else {
        res.end('Not Found')
    }
});
server.listen(4000, ()=>{

})

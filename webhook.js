let http = require('http')
let crypto  = require('crypto')
let {spawn} = require('child_process')
let SECRET = '123456'
function sign(body){
    return 'sha1='+crypto.createHmac('sha1', SECRET).update(body).digest('hex');
}   
let server = http.createServer(function(req, res){
    if(req.method == 'POST' && req.url == '/webhook'){
        // https://121.36.36.62:4000/webhook 向这个地址发送post请求
        console.log(req.method, req.url)
        // 拿到客户端发送过来的请求体
        let buffers = []
        req.on('data', function(buffer){
            buffers.push(buffer)
        })
        req.on('end', function(bufffer){
            let body = Buffer.concat(buffers)
            let event = req.headers['x-gitHub-event'] //小写 event=push
            // github请求过来时候, 要传递请求body, 另外还会传一个signature过来, 你需要验证签名对不对
            let signature = req.headers['x-hub-signature']
            if(signature !== sign(body)){
                return res.end('Not Allowed')
            }
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ok: true})) // 告诉github服务器, 成功了
            if(event === 'push'){
                //开始部署
                let payload = JSON.parse(body)
                let child = spawn('sh', [`./${payload.respository.name}.sh`])
                let buffers = []
                child.stdout.on('data', function(buffer){
                    buffers.push(buffer)
                })
                child.stdout.on('end', function(buffer){
                    let log = Buffer.concat(buffers)
                    console.log(log)
                })

            }
        })
      
    } else {
        res.end('Not Found')
    }
});
server.listen(4000, ()=>{
    console.log('webhook服务器已在4000端口启动')
});

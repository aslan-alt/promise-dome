import 'ts-node'
class Promise2 {
    callbacks = []
    status = 'pending'
    resolve = (result) => {
        if (this.status !== 'pending') return
        this.status = 'fulfilled'
        process.nextTick(() => {
            this.callbacks.forEach(handle => {
                if (typeof handle[0] === 'function') {
                    let x
                    try {
                        x = handle[0].call(undefined, result)
                    } catch (e) {
                        return this.reject(e)
                    }
                    handle[2].resolveWith(x)
                }
            })
        })
    }
    reject = (reason) => {
        if (this.status !== 'pending') return;
        this.status = 'rejected'
        process.nextTick(() => {
            this.callbacks.forEach(handle => {
                if (typeof handle[1] === 'function') {
                    let x
                    try {
                        x = handle[1].call(undefined, reason)
                    } catch (e) {
                        return this.reject(e)
                    }
                    handle[2].resolveWith(x)
                }
            })
        })
    }
    constructor(fn) {
        if (typeof fn !== 'function') {
            throw new Error('Promise只接受函数')
        }
        fn(this.resolve.bind(this), this.reject.bind(this))

    }
    then(success?, failed?) {
        const handle = [];
        (typeof success === 'function') && (handle[0] = success);
        (typeof failed === 'function') && (handle[1] = failed);
        handle[2] = new Promise2(() => { })
        this.callbacks.push(handle)
        return handle[2]
    }
    resolveWith(x) {
        if (this === x) {
            return this.reject(new TypeError())
        }

        if (x instanceof Promise2) {
            x.then((result) => {
                this.resolve(result)
            }, (reason) => {
                this.reject(reason)
            })
        }
        if (x instanceof Object) {
            let then
            try {
                then = x.then
            } catch (e) {
                this.reject(e)
            }
            if (then instanceof Function) {
                try {
                    x.then(y => {
                        y => {
                            this.resolveWith(y)
                        }
                    }, r => {
                        this.reject(r)
                    })
                } catch (e) {
                    this.reject(e)
                }

            } else {
                this.resolve(x)
            }
        } else {
            this.resolve(x)
        }
    }

}

export default Promise2
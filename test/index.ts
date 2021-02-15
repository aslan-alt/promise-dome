import * as chai from 'chai'
import * as sinon from 'sinon'
import * as sinonChai from 'sinon-chai'
import Promise2 from '../src'

chai.use(sinonChai)
const assert = chai.assert

describe('Promise', () => {
    it('它是一个类', () => {
        assert.isFunction(Promise2)
        assert.isObject(Promise2.prototype)
    })
    it('Promise()如果接受的不是一个函数就报错', () => {
        assert.throw(() => {
            //@ts-ignore
            new Promise2()//这里期待报错，不穿参会报错哦
            // new Promise2(() => { })//如果你写成这样test就过不了
        })
        assert.throw(() => {
            //@ts-ignore
            new Promise2(1)
        })
    })
    it('newPromise()返回的对象是有then方法的', () => {
        const promise = new Promise2(() => { })
        assert.isObject(promise)
        assert.isFunction(promise.then)
    })
    it('newPromise(fn)接受的fn是立即执行的', () => {
        const fn = sinon.fake()
        new Promise2(fn)
        assert(fn.called)

    })
    it('new Promise2(fn)fn接受两个函数', () => {
        new Promise2((resolve, reject) => {
            assert.isFunction(resolve)
            assert.isFunction(reject)
        })
    })
    it('promise.then(success,reject)中的success会在resolve调用时执行', () => {
        const succeed = sinon.fake()
        const promise = new Promise2((resolve, reject) => {
            assert(succeed.notCalled)
            resolve()
            setTimeout(() => {
                assert(succeed.called)
            })
        })
        promise.then(succeed)
    })
    it('promise.then(null,failed)中的failed会在reject调用时执行', (done) => {
        const failed = sinon.fake()
        const promise = new Promise2((resolve, reject) => {
            assert(failed.notCalled)
            reject()
            setTimeout(() => {
                assert(failed.called)
                done()
            })
        })
        promise.then(null, failed)
    })
    it('promise.then(false,null) then中接受的不是函数会忽略，不报错', () => {
        const promise = new Promise2((resolve, reject) => {
            resolve()
        })
        promise.then(false, null)
    })
    it('promise(resolve,reject)中的resolve,reject只会被调用一次', () => {
        const succeed = sinon.fake()
        const promise = new Promise2((resolve, reject) => {
            resolve()
            resolve()
            setTimeout(() => {
                assert(succeed.calledOnce)
            })
        })
        promise.then(succeed)
    })
    it('resolve拿到的结果与then成功的回调中的结果一致，reject拿到的结果与then中失败回调中的一致', () => {
        const promise = new Promise2((resolve, reject) => {
            resolve(123)
        })
        promise.then((res) => {
            assert(res === 123)
        })
    })
    it('在代码执行完之前不得执行then中的回调', (done) => {
        const succeed = sinon.fake()
        const promise = new Promise2((resolve, reject) => {
            resolve()
        })
        promise.then(succeed)
        assert(succeed.notCalled)
        setTimeout(() => {
            assert(succeed.called)
            done()
        })
        it('resolve,reject如果不穿this，默认为undefined', (done) => {
            const promise = new Promise2((resolve, reject) => {
                resolve()
            })
            promise.then(function () {
                'use strict'
                assert(this === undefined)
                done()
            })
        })

    })
    it('then可以被调用多次,并且按顺序调用', (done) => {
        const succeed = [sinon.fake(), sinon.fake(), sinon.fake()]
        const promise = new Promise2((resolve, reject) => {
            resolve()
        })
        promise.then(succeed[0])
        promise.then(succeed[1])
        promise.then(succeed[2])
        setTimeout(() => {
            assert(succeed[0].called)
            assert(succeed[1].called)
            assert(succeed[2].called)
            assert(succeed[1].calledAfter(succeed[0]))
            assert(succeed[2].calledAfter(succeed[1]))
            done()
        })

    })
    it('then返回一个Promise,可以连续then并且可以把结果往后传递', (done) => {
        const promise = new Promise2((resolve, reject) => {
            resolve()
        })
        const promise2 = promise.then(() => '成功').then(res => {
            assert.equal(res, '成功')
            done()
        })
        assert(promise2 instanceof Promise2)
    })
    it('then中返回的promise 可以结果成功会走resolve/失败可以走reject', (done) => {
        const fn = sinon.fake()
        const promise1 = new Promise2((resolve, reject) => {
            resolve()
        })
        const promise2 = promise1.then(() => new Promise2(resolve => resolve()))
        promise2.then(fn)
        setTimeout(() => {
            assert(fn.called)
            done()
        })

    })
})

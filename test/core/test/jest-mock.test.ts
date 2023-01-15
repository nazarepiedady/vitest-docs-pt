import { describe, expect, it, vi } from 'vitest'

describe('jest mock compat layer', () => {
  const returnFactory = (type: string) => (value: any) => ({ type, value })

  const r = returnFactory('return')
  const e = returnFactory('throw')

  it('works with name', () => {
    const spy = vi.fn()
    spy.mockName('spy test name')
    expect(spy.getMockName()).toBe('spy test name')
  })

  it('clearing', () => {
    const spy = vi.fn()

    spy('hello')

    expect(spy.mock.calls).toHaveLength(1)
    expect(spy.mock.calls[0]).toEqual(['hello'])

    spy('world')
    expect(spy.mock.calls).toEqual([['hello'], ['world']])

    spy.mockReset() // same as mockClear()

    expect(spy.mock.calls).toEqual([])
  })

  it('clearing instances', () => {
    const Spy = vi.fn(() => ({}))

    expect(Spy.mock.instances).toHaveLength(0)
    // eslint-disable-next-line no-new
    new Spy()
    expect(Spy.mock.instances).toHaveLength(1)

    Spy.mockReset() // same as mockClear()

    expect(Spy.mock.instances).toHaveLength(0)
  })

  it('implementation sync fn', () => {
    const originalFn = function () {
      return 'original'
    }
    const spy = vi.fn(originalFn)

    spy() // returns 'original'

    expect(spy.getMockImplementation()).toBe(undefined)

    spy.mockReturnValueOnce('2-once').mockReturnValueOnce('3-once')

    spy() // returns '2-once'
    spy() // returns '3-once'
    spy() // returns 'original'

    const implOnce = () => 'once'

    spy.mockImplementationOnce(implOnce)

    spy() // returns 'once'
    spy() // returns 'original'

    expect(spy.getMockImplementation() === implOnce).toBe(false) // jest doesn't store Once implementations

    const impl = () => 'unlimited'

    spy.mockImplementation(impl)

    spy() // returns 'unlimited'
    spy()
    spy()

    expect(spy.getMockImplementation() === impl).toBe(true)

    spy.mockReturnValue('return-unlimited')

    spy()
    spy()

    expect(spy.mock.results).toEqual([
      r('original'),
      r('2-once'),
      r('3-once'),
      r('original'),
      r('once'),
      r('original'),
      r('unlimited'),
      r('unlimited'),
      r('unlimited'),
      r('return-unlimited'),
      r('return-unlimited'),
    ])

    spy.mockRestore()

    expect(spy.getMockImplementation()).toBe(undefined)

    expect(spy.mock.results).toEqual([])
  })

  it('implementation async fn', async () => {
    const originalFn = async function () {
      return 'original'
    }
    const spy = vi.fn(originalFn)

    await spy() // returns 'original'

    spy
      .mockResolvedValue('unlimited')
      .mockResolvedValueOnce('3-once')
      .mockResolvedValueOnce('4-once')

    await spy()
    await spy()
    await spy()
    await spy()

    expect(spy.mock.results).toEqual([
      r('original'),
      r('3-once'),
      r('4-once'),
      r('unlimited'),
      r('unlimited'),
    ])
  })

  it('invocationOrder', () => {
    const a = vi.fn()
    const b = vi.fn()

    a()
    b()

    expect(a.mock.invocationCallOrder[0]).toBeLessThan(b.mock.invocationCallOrder[0])
  })

  it('getter spyOn', () => {
    const obj = {
      get getter() {
        return 'original'
      },
    }

    const spy = vi.spyOn(obj, 'getter', 'get')

    expect(obj.getter).toBe('original')

    spy.mockImplementation(() => 'mocked').mockImplementationOnce(() => 'once')

    expect(obj.getter).toBe('once')
    expect(obj.getter).toBe('mocked')
    expect(obj.getter).toBe('mocked')

    spy.mockReturnValue('returned').mockReturnValueOnce('returned-once')

    expect(obj.getter).toBe('returned-once')
    expect(obj.getter).toBe('returned')
    expect(obj.getter).toBe('returned')

    spy.mockRestore()

    expect(obj.getter).toBe('original')
  })

  it('getter function spyOn', () => {
    const obj = {
      get getter() {
        return function () {
          return 'original'
        }
      },
    }

    const spy = vi.spyOn(obj, 'getter')

    expect(obj.getter()).toBe('original')

    spy.mockImplementation(() => 'mocked').mockImplementationOnce(() => 'once')

    expect(obj.getter()).toBe('once')
    expect(obj.getter()).toBe('mocked')
    expect(obj.getter()).toBe('mocked')
  })

  it('setter spyOn', () => {
    let setValue = 'original'
    let mockedValue = 'none'

    const obj = {
      get setter() {
        return setValue
      },
      set setter(v: any) {
        setValue = v
      },
    }

    const spy = vi.spyOn(obj, 'setter', 'set')

    obj.setter = 'first'

    expect(setValue).toBe('first')
    expect(mockedValue).toBe('none')

    spy.mockImplementation(() => (mockedValue = 'mocked')).mockImplementationOnce(() => (mockedValue = 'once'))

    obj.setter = 'i can do whatever'
    expect(mockedValue).toBe('once')
    expect(setValue).toBe('first')

    obj.setter = 'does nothing'
    expect(mockedValue).toBe('mocked')
    expect(setValue).toBe('first')

    obj.setter = 'since setter is mocked'
    expect(mockedValue).toBe('mocked')
    expect(setValue).toBe('first')

    spy.mockRestore()

    obj.setter = 'last'

    expect(spy.getMockImplementation()).toBe(undefined)

    expect(setValue).toBe('last')
  })

  it('should work - setter', () => {
    const obj = {
      _property: false,
      set property(value) {
        this._property = value
      },
      get property() {
        return this._property
      },
    }

    const spy = vi.spyOn(obj, 'property', 'set')
    obj.property = true
    expect(spy).toHaveBeenCalled()
    expect(obj.property).toBe(true)
    obj.property = false
    spy.mockRestore()
    obj.property = true
    // unlike jest, mockRestore only restores implementation to the original one,
    // we are still spying on the setter
    expect(spy).toHaveBeenCalled()
    expect(obj.property).toBe(true)
  })

  it('throwing', async () => {
    const fn = vi.fn(() => {
      // eslint-disable-next-line no-throw-literal
      throw 'error'
    })

    try {
      fn()
    }
    catch {}

    expect(fn.mock.results).toEqual([
      e('error'),
    ])
  })

  it('mockRejectedValue', async () => {
    const safeCall = async (fn: () => void) => {
      try {
        await fn()
      }
      catch {}
    }

    const spy = vi.fn()
      .mockRejectedValue(new Error('error'))
      .mockRejectedValueOnce(new Error('once'))

    await safeCall(spy)
    await safeCall(spy)

    expect(spy.mock.results[0]).toEqual(e(new Error('once')))
    expect(spy.mock.results[1]).toEqual(e(new Error('error')))
  })
  it('mockResolvedValue', async () => {
    const spy = vi.fn()
      .mockResolvedValue('resolved')
      .mockResolvedValueOnce('once')

    await spy()
    await spy()

    expect(spy.mock.results[0]).toEqual(r('once'))
    expect(spy.mock.results[1]).toEqual(r('resolved'))
  })

  it('tracks instances made by mocks', () => {
    const Fn = vi.fn()
    expect(Fn.mock.instances).toEqual([])

    const instance1 = new Fn()
    expect(Fn.mock.instances[0]).toBe(instance1)

    const instance2 = new Fn()
    expect(Fn.mock.instances[1]).toBe(instance2)
  })
})

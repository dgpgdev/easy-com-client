import Emitter from 'events'

/**
 * Client class to communicate with easy-com server
 */
class EasyComClient extends Emitter.EventEmitter {
	/**
	 * [uri description]
	 * @type {String}
	 */
	constructor(uri = '', { reconnect = false, attempt = 0, delay = 1000 }) {
		super()
		this._uri = uri
		this._reconnect = reconnect
		this._currentAttempt = 0
		this._attempt = attempt
		this._delay = delay
		this._interval = 0
	}

	/**
	 * call method to websocket server
	 */
	invoke(...args) {
		this._ws.send(JSON.stringify(args))
	}

	/**
	 * initialize all listeners
	 */
	initListeners() {
		/**
		 * parse data received by server
		 * @method onmessage
		 * @param  {Array}  evt a string who represent array data sent by server
		 */
		this._ws.onmessage = (evt) => {
			this.emit.apply(this, JSON.parse(evt.data))
		}

		/**
		 * [onopen description]
		 * @method onopen
		 * @param  {[type]} evt [description]
		 * @return {[type]}     [description]
		 */
		this._ws.onopen = (evt) => {
			clearInterval(this._interval)
			this._currentAttempt = 0
			this.emit('open', evt)
		}

		/**
		 * [onerror description]
		 * @method onerror
		 * @param  {[type]} evt [description]
		 * @return {[type]}     [description]
		 */
		this._ws.onerror = (evt) => {
			this.emit('error', evt)
		}

		/**
		 * [onclose description]
		 * @method onclose
		 * @param  {[type]} evt [description]
		 * @return {[type]}     [description]
		 */
		this._ws.onclose = (evt) => {
			this.emit('close', evt)
			if (this._reconnect) {
				this._interval = setTimeout(this.reconnect, this._delay, this)
			}
		}
	}

	/**
	 * Called when reconnect option is true.
	 * Dispatch attempt event when the websocket try to connect.
	 */
	reconnect(scope) {
		if (scope._ws.readyState === 3) {
			if (scope._currentAttempt === scope._attempt && scope._attempt != 0) {
				clearInterval(scope._interval)
				scope.emit('max_attempt', {
					attempt: scope._currentAttempt,
					max_attempt: scope._attempt,
				})
			} else {
				scope._currentAttempt += 1
				scope.emit('attempt', {
					attempt: scope._currentAttempt,
					max_attempt: scope._attempt,
				})
				scope.connect()
			}
		}
	}

	/**
	 * Close the websocket
	 */
	close() {
		this._reconnect = false
		this._ws.close()
	}

	/**
	 * Connect the websocket
	 */
	connect() {
		this._ws = new WebSocket(this._uri)
		this.initListeners()
	}
}

export default EasyComClient

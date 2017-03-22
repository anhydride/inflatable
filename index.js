// inflatable/reinflate
// inflatable/rehydrate
// inflatable/inflate

import classOf
	from 'classof'

import {is}
	from 'preposition'

function isEllipsis(w) {
	return w === '...'
}

function isInteger(w) {
	return w === Math.round(w)
}

export default reinflate

export function reinflate(w) {
	return rehydrate(inflate(w))
}

export function rehydrate(w) {
	switch (classOf(w)) {
		case 'Array': return rehydrate$Array(w)
		case 'Object': return rehydrate$Object(w)
		default: return w
	}
}

function rehydrate$Array(that) {
	const l = that.length; let $0, $1, _, $n, $d = 1
	switch (l) {
		case 3: [$0,     _, $n] = that
			if (isEllipsis(_) && isInteger($0) && isInteger($n)) break
			return rehydrate$ArrayElements(that)
			
		case 4: [$0, $1, _, $n] = that
			if (isEllipsis(_) && isInteger($0) && isInteger($1) && isInteger($n)) break
			return rehydrate$ArrayElements(that)

		default:
			return rehydrate$ArrayElements(that)
	}

	const copy = that.slice(), splice$arguments = [l - 2, 1]
	for (let $i = $0; i <= $n; $i += $d) splice$arguments.push($i)
	copy.splice.apply(copy, splice$arguments)
	return copy
}

function rehydrate$ArrayElements(that) {
	return that.map(rehydrate)
}

function rehydrate$Object(w) {
	const properties = {}, elements = [], indicies = []
	const meta = {constructor: Object, arguments: []}

	// Recursively rehydrate all children.
	for (let k in w) {
		const v = rehydrate(w[k])
		if (/[^0-9]/.test(k)) {
			properties[k] = v
		}
		else {
			elements.push(v)
			indicies.push(parseInt(k, 10))
		}
	}

	// If there is a contiguous range of indicies,
	// treat the resulting object as an array.
	if (indicies.length === 1 + Math.max.apply(Math, indicies))
		meta.constructor = Array

	// If a constructor has been supplied (or whatever),
	// treat the resulting object as an instance.
	switch (false) {
		case properties.hasOwnProperty('constructor'):
		case is.Function(properties.constructor):
			break
		default:
			meta.constructor = properties.constructor
			delete properties.constructor
	}

	switch (false) {
		case properties.hasOwnProperty('arguments'):
		case is.Array(properties.arguments):
			break
		default:
			meta.constructor = properties.arguments
			delete properties.arguments
	}

	const instance = arguments.length
		?	new meta.constructor(...meta.arguments)
		:	Object.create(meta.constructor.prototype)

	for (let i = 0, l = indicies.length; i < l; i ++)
		instance[indicies[i]] = elements[i]

	for (let k in properties)
		instance[k] = properties[k]

	return instance
}

export function inflate(w) {
	switch (classOf(w)) {
		case 'Object': return inflate$Object(w)
		default: return w
	}
}

export function inflate$Object(/* ...arguments */) {
	const dictionary = {}
	Inflate.apply(dictionary, arguments)
	return dictionary
}

function Inflate(/* ...arguments */) {
	for (let i = 0, l = arguments.length; i < l; i++)
		Inflate$1.call(this, arguments[i])
}

function Inflate$1(dictionary) {
	for (let path in dictionary)
		Inflate$2.call(this, path, dictionary[path])
}

function Inflate$2(path, value) {
	if (is.ObjectInstance(value)) value = inflate$Object(value)
	const substitutions = []
	while (true) {
		const p = path.replace(/[{]([^{}]+)[}]/g, substitute)
		if (p == path) break
		path = p
	}
	Downwards.call(this, path)

	function substitute(/* ...arguments */) {
		return reference(arguments[1])
	}

	function reference(match) {
		return '#' + (substitutions.push(match) - 1)
	}

	function dereference(key) {
		if ('#' == key[0])
			return substitutions[parseInt(key.substr(1), 10)]
	}

	function Downwards(/* ...arguments */) {
		for (let i = arguments.length - 1; ~i; i--)
			arguments[i] = arguments[i].match(/[^.]+/g)
		return Downwards$N.apply(this, [].concat(...arguments))
	}

	function Downwards$N(/* ...arguments */) {
		if (arguments.length) Downwards$1$N.apply(this, arguments)
	}

	function Downwards$1$N(key, ...keys) {
		key = key.trim()
		const substitution = dereference(key)
		switch (true) {
			case is.String(substitution):
				Sideways.call(this, substitution, ...keys)
				break
			case 0 === keys.length:
				this[key] = value
				break
			case ! (key in this):
				this[key] = {}
			default:
				Downwards.call(this[key], ...keys)
		}
	}

	function Sideways(substitution, ...keys) {
		const paths = substitution.match(/[^,]+/g)
		for (let i = 0, l = paths.length; i < l; i++) {
			const path = paths[i]
			Downwards.call(this, path, ...keys)
		}
	}

}

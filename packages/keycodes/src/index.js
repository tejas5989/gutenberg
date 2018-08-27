/**
 * Note: The order of the modifier keys in many of the [foo]Shortcut()
 * functions in this file are intentional and should not be changed. They're
 * designed to fit with the standard menu keyboard shortcuts shown in the
 * user's platform.
 *
 * For example, on MacOS menu shortcuts will place Shift before Command, but
 * on Windows Control will usually come first. So don't provide your own
 * shortcut combos directly to keyboardShortcut().
 */

/**
 * External dependencies
 */
import { get, mapValues, includes, capitalize } from 'lodash-es';

/**
 * Internal dependencies
 */
import { isAppleOS } from './platform';

export const BACKSPACE = 8;
export const TAB = 9;
export const ENTER = 13;
export const ESCAPE = 27;
export const SPACE = 32;
export const LEFT = 37;
export const UP = 38;
export const RIGHT = 39;
export const DOWN = 40;
export const DELETE = 46;

export const F10 = 121;

export const ALT = 'alt';
export const CTRL = 'ctrl';
// Understood in both Mousetrap and TinyMCE.
export const COMMAND = 'meta';
export const SHIFT = 'shift';

const modifiers = {
	primary: ( _isApple ) => _isApple() ? [ COMMAND ] : [ CTRL ],
	primaryShift: ( _isApple ) => _isApple() ? [ SHIFT, COMMAND ] : [ CTRL, SHIFT ],
	primaryAlt: ( _isApple ) => _isApple() ? [ ALT, COMMAND ] : [ CTRL, ALT ],
	secondary: ( _isApple ) => _isApple() ? [ SHIFT, ALT, COMMAND ] : [ CTRL, SHIFT, ALT ],
	access: ( _isApple ) => _isApple() ? [ CTRL, ALT ] : [ SHIFT, ALT ],
	ctrl: () => [ CTRL ],
	ctrlShift: () => [ CTRL, SHIFT ],
	shift: () => [ SHIFT ],
	shiftAlt: () => [ SHIFT, ALT ],
};

/**
 * An object that contains functions to get raw shortcuts.
 * E.g. rawShortcut.primary( 'm' ) will return 'meta+m' on Mac.
 * These are intended for user with the KeyboardShortcuts component or TinyMCE.
 *
 * @type {Object} Keyed map of functions to raw shortcuts.
 */
export const rawShortcut = mapValues( modifiers, ( modifier ) => {
	return ( character, _isApple = isAppleOS ) => {
		return [ ...modifier( _isApple ), character.toLowerCase() ].join( '+' );
	};
} );

/**
 * Return an array of the parts of a keyboard shortcut chord for display
 * E.g displayShortcutList.primary( 'm' ) will return [ '⌘', 'M' ] on Mac.
 *
 * @type {Object} keyed map of functions to shortcut sequences
 */
export const displayShortcutList = mapValues( modifiers, ( modifier ) => {
	return ( character, _isApple = isAppleOS ) => {
		const isMac = _isApple();
		const replacementKeyMap = {
			[ ALT ]: isMac ? 'Option' : 'Alt',
			[ CTRL ]: 'Ctrl',
			[ COMMAND ]: '⌘',
			[ SHIFT ]: 'Shift',
		};

		const modifierKeys = modifier( _isApple ).reduce( ( accumulator, key ) => {
			const replacementKey = get( replacementKeyMap, key, key );
			// When the mac's clover symbol is used, do not display a + afterwards
			if ( replacementKey === '⌘' ) {
				return [ ...accumulator, replacementKey ];
			}

			return [ ...accumulator, replacementKey, '+' ];
		}, [] );

		const capitalizedCharacter = capitalize( character );
		return [ ...modifierKeys, capitalizedCharacter ];
	};
} );

/**
 * An object that contains functions to display shortcuts.
 * E.g. displayShortcut.primary( 'm' ) will return '⌘M' on Mac.
 *
 * @type {Object} Keyed map of functions to display shortcuts.
 */
export const displayShortcut = mapValues( displayShortcutList, ( sequence ) => {
	return ( character, _isApple = isAppleOS ) => sequence( character, _isApple ).join( '' );
} );

/**
 * An object that contains functions to check if a keyboard event matches a
 * predefined shortcut combination.
 * E.g. isKeyboardEvent.primary( event, 'm' ) will return true if the event
 * signals pressing ⌘M.
 *
 * @type {Object} Keyed map of functions to match events.
 */
export const isKeyboardEvent = mapValues( modifiers, ( getModifiers ) => {
	return ( event, character, _isApple = isAppleOS ) => {
		const mods = getModifiers( _isApple );

		if ( ! mods.every( ( key ) => event[ `${ key }Key` ] ) ) {
			return false;
		}

		if ( ! character ) {
			return includes( mods, event.key.toLowerCase() );
		}

		return event.key === character;
	};
} );

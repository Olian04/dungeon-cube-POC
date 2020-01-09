(function () {
  'use strict';

  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0

  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.

  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */
  var __assign = function () {
    __assign = Object.assign || function __assign(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];

        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }

      return t;
    };

    return __assign.apply(this, arguments);
  };

  function __rest(s, e) {
    var t = {};

    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];

    if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
    }
    return t;
  }

  function __values(o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator],
        i = 0;
    if (m) return m.call(o);
    return {
      next: function () {
        if (o && i >= o.length) o = void 0;
        return {
          value: o && o[i++],
          done: !o
        };
      }
    };
  }

  function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o),
        r,
        ar = [],
        e;

    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    } catch (error) {
      e = {
        error: error
      };
    } finally {
      try {
        if (r && !r.done && (m = i["return"])) m.call(i);
      } finally {
        if (e) throw e.error;
      }
    }

    return ar;
  }

  function __spread() {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));

    return ar;
  }

  var STATE_DELIMITER = '.';
  var EMPTY_ACTIVITY_MAP = {};
  var DEFAULT_GUARD_TYPE = 'xstate.guard';
  var TARGETLESS_KEY = '';

  var IS_PRODUCTION = process.env.NODE_ENV === 'production';

  function keys(value) {
    return Object.keys(value);
  }

  function matchesState(parentStateId, childStateId, delimiter) {
    if (delimiter === void 0) {
      delimiter = STATE_DELIMITER;
    }

    var parentStateValue = toStateValue(parentStateId, delimiter);
    var childStateValue = toStateValue(childStateId, delimiter);

    if (isString(childStateValue)) {
      if (isString(parentStateValue)) {
        return childStateValue === parentStateValue;
      } // Parent more specific than child


      return false;
    }

    if (isString(parentStateValue)) {
      return parentStateValue in childStateValue;
    }

    return keys(parentStateValue).every(function (key) {
      if (!(key in childStateValue)) {
        return false;
      }

      return matchesState(parentStateValue[key], childStateValue[key]);
    });
  }

  function getEventType(event) {
    try {
      return isString(event) || typeof event === 'number' ? "" + event : event.type;
    } catch (e) {
      throw new Error('Events must be strings or objects with a string event.type property.');
    }
  }

  function toStatePath(stateId, delimiter) {
    try {
      if (isArray(stateId)) {
        return stateId;
      }

      return stateId.toString().split(delimiter);
    } catch (e) {
      throw new Error("'" + stateId + "' is not a valid state path.");
    }
  }

  function isStateLike(state) {
    return typeof state === 'object' && 'value' in state && 'context' in state && 'event' in state && '_event' in state;
  }

  function toStateValue(stateValue, delimiter) {
    if (isStateLike(stateValue)) {
      return stateValue.value;
    }

    if (isArray(stateValue)) {
      return pathToStateValue(stateValue);
    }

    if (typeof stateValue !== 'string') {
      return stateValue;
    }

    var statePath = toStatePath(stateValue, delimiter);
    return pathToStateValue(statePath);
  }

  function pathToStateValue(statePath) {
    if (statePath.length === 1) {
      return statePath[0];
    }

    var value = {};
    var marker = value;

    for (var i = 0; i < statePath.length - 1; i++) {
      if (i === statePath.length - 2) {
        marker[statePath[i]] = statePath[i + 1];
      } else {
        marker[statePath[i]] = {};
        marker = marker[statePath[i]];
      }
    }

    return value;
  }

  function mapValues(collection, iteratee) {
    var result = {};
    var collectionKeys = keys(collection);

    for (var i = 0; i < collectionKeys.length; i++) {
      var key = collectionKeys[i];
      result[key] = iteratee(collection[key], key, collection, i);
    }

    return result;
  }

  function mapFilterValues(collection, iteratee, predicate) {
    var e_1, _a;

    var result = {};

    try {
      for (var _b = __values(keys(collection)), _c = _b.next(); !_c.done; _c = _b.next()) {
        var key = _c.value;
        var item = collection[key];

        if (!predicate(item)) {
          continue;
        }

        result[key] = iteratee(item, key, collection);
      }
    } catch (e_1_1) {
      e_1 = {
        error: e_1_1
      };
    } finally {
      try {
        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
      } finally {
        if (e_1) throw e_1.error;
      }
    }

    return result;
  }
  /**
   * Retrieves a value at the given path.
   * @param props The deep path to the prop of the desired value
   */


  var path = function (props) {
    return function (object) {
      var e_2, _a;

      var result = object;

      try {
        for (var props_1 = __values(props), props_1_1 = props_1.next(); !props_1_1.done; props_1_1 = props_1.next()) {
          var prop = props_1_1.value;
          result = result[prop];
        }
      } catch (e_2_1) {
        e_2 = {
          error: e_2_1
        };
      } finally {
        try {
          if (props_1_1 && !props_1_1.done && (_a = props_1.return)) _a.call(props_1);
        } finally {
          if (e_2) throw e_2.error;
        }
      }

      return result;
    };
  };
  /**
   * Retrieves a value at the given path via the nested accessor prop.
   * @param props The deep path to the prop of the desired value
   */


  function nestedPath(props, accessorProp) {
    return function (object) {
      var e_3, _a;

      var result = object;

      try {
        for (var props_2 = __values(props), props_2_1 = props_2.next(); !props_2_1.done; props_2_1 = props_2.next()) {
          var prop = props_2_1.value;
          result = result[accessorProp][prop];
        }
      } catch (e_3_1) {
        e_3 = {
          error: e_3_1
        };
      } finally {
        try {
          if (props_2_1 && !props_2_1.done && (_a = props_2.return)) _a.call(props_2);
        } finally {
          if (e_3) throw e_3.error;
        }
      }

      return result;
    };
  }

  function toStatePaths(stateValue) {
    if (!stateValue) {
      return [[]];
    }

    if (isString(stateValue)) {
      return [[stateValue]];
    }

    var result = flatten(keys(stateValue).map(function (key) {
      var subStateValue = stateValue[key];

      if (typeof subStateValue !== 'string' && (!subStateValue || !Object.keys(subStateValue).length)) {
        return [[key]];
      }

      return toStatePaths(stateValue[key]).map(function (subPath) {
        return [key].concat(subPath);
      });
    }));
    return result;
  }

  function flatten(array) {
    var _a;

    return (_a = []).concat.apply(_a, __spread(array));
  }

  function toArrayStrict(value) {
    if (isArray(value)) {
      return value;
    }

    return [value];
  }

  function toArray(value) {
    if (value === undefined) {
      return [];
    }

    return toArrayStrict(value);
  }

  function mapContext(mapper, context, _event) {
    var e_5, _a;

    if (isFunction(mapper)) {
      return mapper(context, _event.data);
    }

    var result = {};

    try {
      for (var _b = __values(keys(mapper)), _c = _b.next(); !_c.done; _c = _b.next()) {
        var key = _c.value;
        var subMapper = mapper[key];

        if (isFunction(subMapper)) {
          result[key] = subMapper(context, _event.data);
        } else {
          result[key] = subMapper;
        }
      }
    } catch (e_5_1) {
      e_5 = {
        error: e_5_1
      };
    } finally {
      try {
        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
      } finally {
        if (e_5) throw e_5.error;
      }
    }

    return result;
  }

  function isBuiltInEvent(eventType) {
    return /^(done|error)\./.test(eventType);
  }

  function isPromiseLike(value) {
    if (value instanceof Promise) {
      return true;
    } // Check if shape matches the Promise/A+ specification for a "thenable".


    if (value !== null && (isFunction(value) || typeof value === 'object') && isFunction(value.then)) {
      return true;
    }

    return false;
  }

  function partition(items, predicate) {
    var e_6, _a;

    var _b = __read([[], []], 2),
        truthy = _b[0],
        falsy = _b[1];

    try {
      for (var items_1 = __values(items), items_1_1 = items_1.next(); !items_1_1.done; items_1_1 = items_1.next()) {
        var item = items_1_1.value;

        if (predicate(item)) {
          truthy.push(item);
        } else {
          falsy.push(item);
        }
      }
    } catch (e_6_1) {
      e_6 = {
        error: e_6_1
      };
    } finally {
      try {
        if (items_1_1 && !items_1_1.done && (_a = items_1.return)) _a.call(items_1);
      } finally {
        if (e_6) throw e_6.error;
      }
    }

    return [truthy, falsy];
  }

  function updateHistoryStates(hist, stateValue) {
    return mapValues(hist.states, function (subHist, key) {
      if (!subHist) {
        return undefined;
      }

      var subStateValue = (isString(stateValue) ? undefined : stateValue[key]) || (subHist ? subHist.current : undefined);

      if (!subStateValue) {
        return undefined;
      }

      return {
        current: subStateValue,
        states: updateHistoryStates(subHist, subStateValue)
      };
    });
  }

  function updateHistoryValue(hist, stateValue) {
    return {
      current: stateValue,
      states: updateHistoryStates(hist, stateValue)
    };
  }

  function updateContext(context, _event, assignActions, state) {
    if (!IS_PRODUCTION) {
      warn(!!context, 'Attempting to update undefined context');
    }

    var updatedContext = context ? assignActions.reduce(function (acc, assignAction) {
      var e_7, _a;

      var assignment = assignAction.assignment;
      var meta = {
        state: state,
        action: assignAction,
        _event: _event
      };
      var partialUpdate = {};

      if (isFunction(assignment)) {
        partialUpdate = assignment(acc, _event.data, meta);
      } else {
        try {
          for (var _b = __values(keys(assignment)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var key = _c.value;
            var propAssignment = assignment[key];
            partialUpdate[key] = isFunction(propAssignment) ? propAssignment(acc, _event.data, meta) : propAssignment;
          }
        } catch (e_7_1) {
          e_7 = {
            error: e_7_1
          };
        } finally {
          try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
          } finally {
            if (e_7) throw e_7.error;
          }
        }
      }

      return Object.assign({}, acc, partialUpdate);
    }, context) : context;
    return updatedContext;
  } // tslint:disable-next-line:no-empty


  var warn = function () {};

  if (!IS_PRODUCTION) {
    warn = function (condition, message) {
      var error = condition instanceof Error ? condition : undefined;

      if (!error && condition) {
        return;
      }

      if (console !== undefined) {
        var args = ["Warning: " + message];

        if (error) {
          args.push(error);
        } // tslint:disable-next-line:no-console


        console.warn.apply(console, args);
      }
    };
  }

  function isArray(value) {
    return Array.isArray(value);
  } // tslint:disable-next-line:ban-types


  function isFunction(value) {
    return typeof value === 'function';
  }

  function isString(value) {
    return typeof value === 'string';
  } // export function memoizedGetter<T, TP extends { prototype: object }>(
  //   o: TP,
  //   property: string,
  //   getter: () => T
  // ): void {
  //   Object.defineProperty(o.prototype, property, {
  //     get: getter,
  //     enumerable: false,
  //     configurable: false
  //   });
  // }


  function toGuard(condition, guardMap) {
    if (!condition) {
      return undefined;
    }

    if (isString(condition)) {
      return {
        type: DEFAULT_GUARD_TYPE,
        name: condition,
        predicate: guardMap ? guardMap[condition] : undefined
      };
    }

    if (isFunction(condition)) {
      return {
        type: DEFAULT_GUARD_TYPE,
        name: condition.name,
        predicate: condition
      };
    }

    return condition;
  }

  function isObservable(value) {
    try {
      return 'subscribe' in value && isFunction(value.subscribe);
    } catch (e) {
      return false;
    }
  }

  var symbolObservable =
  /*#__PURE__*/
  function () {
    return typeof Symbol === 'function' && Symbol.observable || '@@observable';
  }();

  function isMachine(value) {
    try {
      return '__xstatenode' in value;
    } catch (e) {
      return false;
    }
  }

  function toEventObject(event, payload // id?: TEvent['type']
  ) {
    if (isString(event) || typeof event === 'number') {
      return __assign({
        type: event
      }, payload);
    }

    return event;
  }

  function toSCXMLEvent(event, scxmlEvent) {
    if (!isString(event) && '$$type' in event && event.$$type === 'scxml') {
      return event;
    }

    var eventObject = toEventObject(event);
    return __assign({
      name: eventObject.type,
      data: eventObject,
      $$type: 'scxml',
      type: 'external'
    }, scxmlEvent);
  }

  function toTransitionConfigArray(event, configLike) {
    var transitions = toArrayStrict(configLike).map(function (transitionLike) {
      if (typeof transitionLike === 'undefined' || typeof transitionLike === 'string' || isMachine(transitionLike)) {
        // @ts-ignore until Type instantiation is excessively deep and possibly infinite bug is fixed
        return {
          target: transitionLike,
          event: event
        };
      }

      return __assign(__assign({}, transitionLike), {
        event: event
      });
    });
    return transitions;
  }

  function normalizeTarget(target) {
    if (target === undefined || target === TARGETLESS_KEY) {
      return undefined;
    }

    return toArray(target);
  }

  function reportUnhandledExceptionOnInvocation(originalError, currentError, id) {
    if (!IS_PRODUCTION) {
      var originalStackTrace = originalError.stack ? " Stacktrace was '" + originalError.stack + "'" : '';

      if (originalError === currentError) {
        // tslint:disable-next-line:no-console
        console.error("Missing onError handler for invocation '" + id + "', error was '" + originalError + "'." + originalStackTrace);
      } else {
        var stackTrace = currentError.stack ? " Stacktrace was '" + currentError.stack + "'" : ''; // tslint:disable-next-line:no-console

        console.error("Missing onError handler and/or unhandled exception/promise rejection for invocation '" + id + "'. " + ("Original error: '" + originalError + "'. " + originalStackTrace + " Current error is '" + currentError + "'." + stackTrace));
      }
    }
  }

  var ActionTypes;

  (function (ActionTypes) {
    ActionTypes["Start"] = "xstate.start";
    ActionTypes["Stop"] = "xstate.stop";
    ActionTypes["Raise"] = "xstate.raise";
    ActionTypes["Send"] = "xstate.send";
    ActionTypes["Cancel"] = "xstate.cancel";
    ActionTypes["NullEvent"] = "";
    ActionTypes["Assign"] = "xstate.assign";
    ActionTypes["After"] = "xstate.after";
    ActionTypes["DoneState"] = "done.state";
    ActionTypes["DoneInvoke"] = "done.invoke";
    ActionTypes["Log"] = "xstate.log";
    ActionTypes["Init"] = "xstate.init";
    ActionTypes["Invoke"] = "xstate.invoke";
    ActionTypes["ErrorExecution"] = "error.execution";
    ActionTypes["ErrorCommunication"] = "error.communication";
    ActionTypes["ErrorPlatform"] = "error.platform";
    ActionTypes["ErrorCustom"] = "xstate.error";
    ActionTypes["Update"] = "xstate.update";
    ActionTypes["Pure"] = "xstate.pure";
  })(ActionTypes || (ActionTypes = {}));

  var SpecialTargets;

  (function (SpecialTargets) {
    SpecialTargets["Parent"] = "#_parent";
    SpecialTargets["Internal"] = "#_internal";
  })(SpecialTargets || (SpecialTargets = {}));

  var start = ActionTypes.Start;
  var stop = ActionTypes.Stop;
  var raise = ActionTypes.Raise;
  var send = ActionTypes.Send;
  var cancel = ActionTypes.Cancel;
  var nullEvent = ActionTypes.NullEvent;
  var assign = ActionTypes.Assign;
  var after = ActionTypes.After;
  var doneState = ActionTypes.DoneState;
  var log = ActionTypes.Log;
  var init = ActionTypes.Init;
  var invoke = ActionTypes.Invoke;
  var errorExecution = ActionTypes.ErrorExecution;
  var errorPlatform = ActionTypes.ErrorPlatform;
  var error = ActionTypes.ErrorCustom;
  var update = ActionTypes.Update;
  var pure = ActionTypes.Pure;

  var initEvent =
  /*#__PURE__*/
  toSCXMLEvent({
    type: init
  });

  function getActionFunction(actionType, actionFunctionMap) {
    return actionFunctionMap ? actionFunctionMap[actionType] || undefined : undefined;
  }

  function toActionObject(action, actionFunctionMap) {
    var actionObject;

    if (isString(action) || typeof action === 'number') {
      var exec = getActionFunction(action, actionFunctionMap);

      if (isFunction(exec)) {
        actionObject = {
          type: action,
          exec: exec
        };
      } else if (exec) {
        actionObject = exec;
      } else {
        actionObject = {
          type: action,
          exec: undefined
        };
      }
    } else if (isFunction(action)) {
      actionObject = {
        // Convert action to string if unnamed
        type: action.name || action.toString(),
        exec: action
      };
    } else {
      var exec = getActionFunction(action.type, actionFunctionMap);

      if (isFunction(exec)) {
        actionObject = __assign(__assign({}, action), {
          exec: exec
        });
      } else if (exec) {
        var type = action.type,
            other = __rest(action, ["type"]);

        actionObject = __assign(__assign({
          type: type
        }, exec), other);
      } else {
        actionObject = action;
      }
    }

    Object.defineProperty(actionObject, 'toString', {
      value: function () {
        return actionObject.type;
      },
      enumerable: false,
      configurable: true
    });
    return actionObject;
  }

  var toActionObjects = function (action, actionFunctionMap) {
    if (!action) {
      return [];
    }

    var actions = isArray(action) ? action : [action];
    return actions.map(function (subAction) {
      return toActionObject(subAction, actionFunctionMap);
    });
  };

  function toActivityDefinition(action) {
    var actionObject = toActionObject(action);
    return __assign(__assign({
      id: isString(action) ? action : actionObject.id
    }, actionObject), {
      type: actionObject.type
    });
  }
  /**
   * Raises an event. This places the event in the internal event queue, so that
   * the event is immediately consumed by the machine in the current step.
   *
   * @param eventType The event to raise.
   */


  function raise$1(event) {
    if (!isString(event)) {
      return send$1(event, {
        to: SpecialTargets.Internal
      });
    }

    return {
      type: raise,
      event: event
    };
  }

  function resolveRaise(action) {
    return {
      type: raise,
      _event: toSCXMLEvent(action.event)
    };
  }
  /**
   * Sends an event. This returns an action that will be read by an interpreter to
   * send the event in the next step, after the current step is finished executing.
   *
   * @param event The event to send.
   * @param options Options to pass into the send event:
   *  - `id` - The unique send event identifier (used with `cancel()`).
   *  - `delay` - The number of milliseconds to delay the sending of the event.
   *  - `to` - The target of this event (by default, the machine the event was sent from).
   */


  function send$1(event, options) {
    return {
      to: options ? options.to : undefined,
      type: send,
      event: isFunction(event) ? event : toEventObject(event),
      delay: options ? options.delay : undefined,
      id: options && options.id !== undefined ? options.id : isFunction(event) ? event.name : getEventType(event)
    };
  }

  function resolveSend(action, ctx, _event, delaysMap) {
    var meta = {
      _event: _event
    }; // TODO: helper function for resolving Expr

    var resolvedEvent = toSCXMLEvent(isFunction(action.event) ? action.event(ctx, _event.data, meta) : action.event);
    var resolvedDelay;

    if (isString(action.delay)) {
      var configDelay = delaysMap && delaysMap[action.delay];
      resolvedDelay = isFunction(configDelay) ? configDelay(ctx, _event.data, meta) : configDelay;
    } else {
      resolvedDelay = isFunction(action.delay) ? action.delay(ctx, _event.data, meta) : action.delay;
    }

    var resolvedTarget = isFunction(action.to) ? action.to(ctx, _event.data, meta) : action.to;
    return __assign(__assign({}, action), {
      to: resolvedTarget,
      _event: resolvedEvent,
      event: resolvedEvent.data,
      delay: resolvedDelay
    });
  }

  var resolveLog = function (action, ctx, _event) {
    return __assign(__assign({}, action), {
      value: isString(action.expr) ? action.expr : action.expr(ctx, _event.data, {
        _event: _event
      })
    });
  };
  /**
   * Cancels an in-flight `send(...)` action. A canceled sent action will not
   * be executed, nor will its event be sent, unless it has already been sent
   * (e.g., if `cancel(...)` is called after the `send(...)` action's `delay`).
   *
   * @param sendId The `id` of the `send(...)` action to cancel.
   */


  var cancel$1 = function (sendId) {
    return {
      type: cancel,
      sendId: sendId
    };
  };
  /**
   * Starts an activity.
   *
   * @param activity The activity to start.
   */


  function start$1(activity) {
    var activityDef = toActivityDefinition(activity);
    return {
      type: ActionTypes.Start,
      activity: activityDef,
      exec: undefined
    };
  }
  /**
   * Stops an activity.
   *
   * @param activity The activity to stop.
   */


  function stop$1(activity) {
    var activityDef = toActivityDefinition(activity);
    return {
      type: ActionTypes.Stop,
      activity: activityDef,
      exec: undefined
    };
  }
  /**
   * Returns an event type that represents an implicit event that
   * is sent after the specified `delay`.
   *
   * @param delayRef The delay in milliseconds
   * @param id The state node ID where this event is handled
   */


  function after$1(delayRef, id) {
    var idSuffix = id ? "#" + id : '';
    return ActionTypes.After + "(" + delayRef + ")" + idSuffix;
  }
  /**
   * Returns an event that represents that a final state node
   * has been reached in the parent state node.
   *
   * @param id The final state node's parent state node `id`
   * @param data The data to pass into the event
   */


  function done(id, data) {
    var type = ActionTypes.DoneState + "." + id;
    var eventObject = {
      type: type,
      data: data
    };

    eventObject.toString = function () {
      return type;
    };

    return eventObject;
  }
  /**
   * Returns an event that represents that an invoked service has terminated.
   *
   * An invoked service is terminated when it has reached a top-level final state node,
   * but not when it is canceled.
   *
   * @param id The final state node ID
   * @param data The data to pass into the event
   */


  function doneInvoke(id, data) {
    var type = ActionTypes.DoneInvoke + "." + id;
    var eventObject = {
      type: type,
      data: data
    };

    eventObject.toString = function () {
      return type;
    };

    return eventObject;
  }

  function error$1(id, data) {
    var type = ActionTypes.ErrorPlatform + "." + id;
    var eventObject = {
      type: type,
      data: data
    };

    eventObject.toString = function () {
      return type;
    };

    return eventObject;
  }

  var isLeafNode = function (stateNode) {
    return stateNode.type === 'atomic' || stateNode.type === 'final';
  };

  function getChildren(stateNode) {
    return keys(stateNode.states).map(function (key) {
      return stateNode.states[key];
    });
  }

  function getAllStateNodes(stateNode) {
    var stateNodes = [stateNode];

    if (isLeafNode(stateNode)) {
      return stateNodes;
    }

    return stateNodes.concat(flatten(getChildren(stateNode).map(getAllStateNodes)));
  }

  function getConfiguration(prevStateNodes, stateNodes) {
    var e_1, _a, e_2, _b, e_3, _c, e_4, _d;

    var prevConfiguration = new Set(prevStateNodes);
    var prevAdjList = getAdjList(prevConfiguration);
    var configuration = new Set(stateNodes);

    try {
      // add all ancestors
      for (var configuration_1 = __values(configuration), configuration_1_1 = configuration_1.next(); !configuration_1_1.done; configuration_1_1 = configuration_1.next()) {
        var s = configuration_1_1.value;
        var m = s.parent;

        while (m && !configuration.has(m)) {
          configuration.add(m);
          m = m.parent;
        }
      }
    } catch (e_1_1) {
      e_1 = {
        error: e_1_1
      };
    } finally {
      try {
        if (configuration_1_1 && !configuration_1_1.done && (_a = configuration_1.return)) _a.call(configuration_1);
      } finally {
        if (e_1) throw e_1.error;
      }
    }

    var adjList = getAdjList(configuration);

    try {
      // add descendants
      for (var configuration_2 = __values(configuration), configuration_2_1 = configuration_2.next(); !configuration_2_1.done; configuration_2_1 = configuration_2.next()) {
        var s = configuration_2_1.value; // if previously active, add existing child nodes

        if (s.type === 'compound' && (!adjList.get(s) || !adjList.get(s).length)) {
          if (prevAdjList.get(s)) {
            prevAdjList.get(s).forEach(function (sn) {
              return configuration.add(sn);
            });
          } else {
            s.initialStateNodes.forEach(function (sn) {
              return configuration.add(sn);
            });
          }
        } else {
          if (s.type === 'parallel') {
            try {
              for (var _e = (e_3 = void 0, __values(getChildren(s))), _f = _e.next(); !_f.done; _f = _e.next()) {
                var child = _f.value;

                if (child.type === 'history') {
                  continue;
                }

                if (!configuration.has(child)) {
                  configuration.add(child);

                  if (prevAdjList.get(child)) {
                    prevAdjList.get(child).forEach(function (sn) {
                      return configuration.add(sn);
                    });
                  } else {
                    child.initialStateNodes.forEach(function (sn) {
                      return configuration.add(sn);
                    });
                  }
                }
              }
            } catch (e_3_1) {
              e_3 = {
                error: e_3_1
              };
            } finally {
              try {
                if (_f && !_f.done && (_c = _e.return)) _c.call(_e);
              } finally {
                if (e_3) throw e_3.error;
              }
            }
          }
        }
      }
    } catch (e_2_1) {
      e_2 = {
        error: e_2_1
      };
    } finally {
      try {
        if (configuration_2_1 && !configuration_2_1.done && (_b = configuration_2.return)) _b.call(configuration_2);
      } finally {
        if (e_2) throw e_2.error;
      }
    }

    try {
      // add all ancestors
      for (var configuration_3 = __values(configuration), configuration_3_1 = configuration_3.next(); !configuration_3_1.done; configuration_3_1 = configuration_3.next()) {
        var s = configuration_3_1.value;
        var m = s.parent;

        while (m && !configuration.has(m)) {
          configuration.add(m);
          m = m.parent;
        }
      }
    } catch (e_4_1) {
      e_4 = {
        error: e_4_1
      };
    } finally {
      try {
        if (configuration_3_1 && !configuration_3_1.done && (_d = configuration_3.return)) _d.call(configuration_3);
      } finally {
        if (e_4) throw e_4.error;
      }
    }

    return configuration;
  }

  function getValueFromAdj(baseNode, adjList) {
    var childStateNodes = adjList.get(baseNode);

    if (!childStateNodes) {
      return {}; // todo: fix?
    }

    if (baseNode.type === 'compound') {
      var childStateNode = childStateNodes[0];

      if (childStateNode) {
        if (isLeafNode(childStateNode)) {
          return childStateNode.key;
        }
      } else {
        return {};
      }
    }

    var stateValue = {};
    childStateNodes.forEach(function (csn) {
      stateValue[csn.key] = getValueFromAdj(csn, adjList);
    });
    return stateValue;
  }

  function getAdjList(configuration) {
    var e_5, _a;

    var adjList = new Map();

    try {
      for (var configuration_4 = __values(configuration), configuration_4_1 = configuration_4.next(); !configuration_4_1.done; configuration_4_1 = configuration_4.next()) {
        var s = configuration_4_1.value;

        if (!adjList.has(s)) {
          adjList.set(s, []);
        }

        if (s.parent) {
          if (!adjList.has(s.parent)) {
            adjList.set(s.parent, []);
          }

          adjList.get(s.parent).push(s);
        }
      }
    } catch (e_5_1) {
      e_5 = {
        error: e_5_1
      };
    } finally {
      try {
        if (configuration_4_1 && !configuration_4_1.done && (_a = configuration_4.return)) _a.call(configuration_4);
      } finally {
        if (e_5) throw e_5.error;
      }
    }

    return adjList;
  }

  function getValue(rootNode, configuration) {
    var config = getConfiguration([rootNode], configuration);
    return getValueFromAdj(rootNode, getAdjList(config));
  }

  function has(iterable, item) {
    if (Array.isArray(iterable)) {
      return iterable.some(function (member) {
        return member === item;
      });
    }

    if (iterable instanceof Set) {
      return iterable.has(item);
    }

    return false; // TODO: fix
  }

  function nextEvents(configuration) {
    return flatten(__spread(new Set(configuration.map(function (sn) {
      return sn.ownEvents;
    }))));
  }

  function isInFinalState(configuration, stateNode) {
    if (stateNode.type === 'compound') {
      return getChildren(stateNode).some(function (s) {
        return s.type === 'final' && has(configuration, s);
      });
    }

    if (stateNode.type === 'parallel') {
      return getChildren(stateNode).every(function (sn) {
        return isInFinalState(configuration, sn);
      });
    }

    return false;
  }

  function stateValuesEqual(a, b) {
    if (a === b) {
      return true;
    }

    if (a === undefined || b === undefined) {
      return false;
    }

    if (isString(a) || isString(b)) {
      return a === b;
    }

    var aKeys = keys(a);
    var bKeys = keys(b);
    return aKeys.length === bKeys.length && aKeys.every(function (key) {
      return stateValuesEqual(a[key], b[key]);
    });
  }

  function isState(state) {
    if (isString(state)) {
      return false;
    }

    return 'value' in state && 'history' in state;
  }

  function bindActionToState(action, state) {
    var exec = action.exec;

    var boundAction = __assign(__assign({}, action), {
      exec: exec !== undefined ? function () {
        return exec(state.context, state.event, {
          action: action,
          state: state,
          _event: state._event
        });
      } : undefined
    });

    return boundAction;
  }

  var State =
  /*#__PURE__*/

  /** @class */
  function () {
    /**
     * Creates a new State instance.
     * @param value The state value
     * @param context The extended state
     * @param historyValue The tree representing historical values of the state nodes
     * @param history The previous state
     * @param actions An array of action objects to execute as side-effects
     * @param activities A mapping of activities and whether they are started (`true`) or stopped (`false`).
     * @param meta
     * @param events Internal event queue. Should be empty with run-to-completion semantics.
     * @param configuration
     */
    function State(config) {
      this.actions = [];
      this.activities = EMPTY_ACTIVITY_MAP;
      this.meta = {};
      this.events = [];
      this.value = config.value;
      this.context = config.context;
      this._event = config._event;
      this._sessionid = config._sessionid;
      this.event = this._event.data;
      this.historyValue = config.historyValue;
      this.history = config.history;
      this.actions = config.actions || [];
      this.activities = config.activities || EMPTY_ACTIVITY_MAP;
      this.meta = config.meta || {};
      this.events = config.events || [];
      this.matches = this.matches.bind(this);
      this.toStrings = this.toStrings.bind(this);
      this.configuration = config.configuration;
      this.transitions = config.transitions;
      this.children = config.children;
      this.done = !!config.done;
      Object.defineProperty(this, 'nextEvents', {
        get: function () {
          return nextEvents(config.configuration);
        }
      });
    }
    /**
     * Creates a new State instance for the given `stateValue` and `context`.
     * @param stateValue
     * @param context
     */


    State.from = function (stateValue, context) {
      if (stateValue instanceof State) {
        if (stateValue.context !== context) {
          return new State({
            value: stateValue.value,
            context: context,
            _event: stateValue._event,
            _sessionid: null,
            historyValue: stateValue.historyValue,
            history: stateValue.history,
            actions: [],
            activities: stateValue.activities,
            meta: {},
            events: [],
            configuration: [],
            transitions: [],
            children: {}
          });
        }

        return stateValue;
      }

      var _event = initEvent;
      return new State({
        value: stateValue,
        context: context,
        _event: _event,
        _sessionid: null,
        historyValue: undefined,
        history: undefined,
        actions: [],
        activities: undefined,
        meta: undefined,
        events: [],
        configuration: [],
        transitions: [],
        children: {}
      });
    };
    /**
     * Creates a new State instance for the given `config`.
     * @param config The state config
     */


    State.create = function (config) {
      return new State(config);
    };
    /**
     * Creates a new `State` instance for the given `stateValue` and `context` with no actions (side-effects).
     * @param stateValue
     * @param context
     */


    State.inert = function (stateValue, context) {
      if (stateValue instanceof State) {
        if (!stateValue.actions.length) {
          return stateValue;
        }

        var _event = initEvent;
        return new State({
          value: stateValue.value,
          context: context,
          _event: _event,
          _sessionid: null,
          historyValue: stateValue.historyValue,
          history: stateValue.history,
          activities: stateValue.activities,
          configuration: stateValue.configuration,
          transitions: [],
          children: {}
        });
      }

      return State.from(stateValue, context);
    };
    /**
     * Returns an array of all the string leaf state node paths.
     * @param stateValue
     * @param delimiter The character(s) that separate each subpath in the string state node path.
     */


    State.prototype.toStrings = function (stateValue, delimiter) {
      var _this = this;

      if (stateValue === void 0) {
        stateValue = this.value;
      }

      if (delimiter === void 0) {
        delimiter = '.';
      }

      if (isString(stateValue)) {
        return [stateValue];
      }

      var valueKeys = keys(stateValue);
      return valueKeys.concat.apply(valueKeys, __spread(valueKeys.map(function (key) {
        return _this.toStrings(stateValue[key], delimiter).map(function (s) {
          return key + delimiter + s;
        });
      })));
    };

    State.prototype.toJSON = function () {
      var _a = this,
          configuration = _a.configuration,
          transitions = _a.transitions,
          jsonValues = __rest(_a, ["configuration", "transitions"]);

      return jsonValues;
    };
    /**
     * Whether the current state value is a subset of the given parent state value.
     * @param parentStateValue
     */


    State.prototype.matches = function (parentStateValue) {
      return matchesState(parentStateValue, this.value);
    };

    return State;
  }();

  function createNullActor(id) {
    return {
      id: id,
      send: function () {
        return void 0;
      },
      subscribe: function () {
        return {
          unsubscribe: function () {
            return void 0;
          }
        };
      },
      toJSON: function () {
        return {
          id: id
        };
      }
    };
  }
  /**
   * Creates a null actor that is able to be invoked given the provided
   * invocation information in its `.meta` value.
   *
   * @param invokeDefinition The meta information needed to invoke the actor.
   */


  function createInvocableActor(invokeDefinition) {
    var tempActor = createNullActor(invokeDefinition.id);
    tempActor.meta = invokeDefinition;
    return tempActor;
  }

  function isActor(item) {
    try {
      return typeof item.send === 'function';
    } catch (e) {
      return false;
    }
  }

  var NULL_EVENT = '';
  var STATE_IDENTIFIER = '#';
  var WILDCARD = '*';
  var EMPTY_OBJECT = {};

  var isStateId = function (str) {
    return str[0] === STATE_IDENTIFIER;
  };

  var createDefaultOptions = function () {
    return {
      actions: {},
      guards: {},
      services: {},
      activities: {},
      delays: {}
    };
  };

  var validateArrayifiedTransitions = function (stateNode, event, transitions) {
    var hasNonLastUnguardedTarget = transitions.slice(0, -1).some(function (transition) {
      return !('cond' in transition) && !('in' in transition) && (isString(transition.target) || isMachine(transition.target));
    });
    var eventText = event === NULL_EVENT ? 'the transient event' : "event '" + event + "'";
    warn(!hasNonLastUnguardedTarget, "One or more transitions for " + eventText + " on state '" + stateNode.id + "' are unreachable. " + "Make sure that the default transition is the last one defined.");
  };

  var StateNode =
  /*#__PURE__*/

  /** @class */
  function () {
    function StateNode(
    /**
     * The raw config used to create the machine.
     */
    config, options,
    /**
     * The initial extended state
     */
    context) {
      var _this = this;

      this.config = config;
      this.context = context;
      /**
       * The order this state node appears. Corresponds to the implicit SCXML document order.
       */

      this.order = -1;
      this.__xstatenode = true;
      this.__cache = {
        events: undefined,
        relativeValue: new Map(),
        initialStateValue: undefined,
        initialState: undefined,
        on: undefined,
        transitions: undefined,
        candidates: {},
        delayedTransitions: undefined
      };
      this.idMap = {};
      this.options = Object.assign(createDefaultOptions(), options);
      this.parent = this.options._parent;
      this.key = this.config.key || this.options._key || this.config.id || '(machine)';
      this.machine = this.parent ? this.parent.machine : this;
      this.path = this.parent ? this.parent.path.concat(this.key) : [];
      this.delimiter = this.config.delimiter || (this.parent ? this.parent.delimiter : STATE_DELIMITER);
      this.id = this.config.id || __spread([this.machine.key], this.path).join(this.delimiter);
      this.version = this.parent ? this.parent.version : this.config.version;
      this.type = this.config.type || (this.config.parallel ? 'parallel' : this.config.states && keys(this.config.states).length ? 'compound' : this.config.history ? 'history' : 'atomic');

      if (!IS_PRODUCTION) {
        warn(!('parallel' in this.config), "The \"parallel\" property is deprecated and will be removed in version 4.1. " + (this.config.parallel ? "Replace with `type: 'parallel'`" : "Use `type: '" + this.type + "'`") + " in the config for state node '" + this.id + "' instead.");
      }

      this.initial = this.config.initial;
      this.states = this.config.states ? mapValues(this.config.states, function (stateConfig, key) {
        var _a;

        var stateNode = new StateNode(stateConfig, {
          _parent: _this,
          _key: key
        });
        Object.assign(_this.idMap, __assign((_a = {}, _a[stateNode.id] = stateNode, _a), stateNode.idMap));
        return stateNode;
      }) : EMPTY_OBJECT; // Document order

      var order = 0;

      function dfs(stateNode) {
        var e_1, _a;

        stateNode.order = order++;

        try {
          for (var _b = __values(getChildren(stateNode)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var child = _c.value;
            dfs(child);
          }
        } catch (e_1_1) {
          e_1 = {
            error: e_1_1
          };
        } finally {
          try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
          } finally {
            if (e_1) throw e_1.error;
          }
        }
      }

      dfs(this); // History config

      this.history = this.config.history === true ? 'shallow' : this.config.history || false;
      this._transient = !this.config.on ? false : Array.isArray(this.config.on) ? this.config.on.some(function (_a) {
        var event = _a.event;
        return event === NULL_EVENT;
      }) : NULL_EVENT in this.config.on;
      this.strict = !!this.config.strict; // TODO: deprecate (entry)

      this.onEntry = toArray(this.config.entry || this.config.onEntry).map(function (action) {
        return toActionObject(action);
      }); // TODO: deprecate (exit)

      this.onExit = toArray(this.config.exit || this.config.onExit).map(function (action) {
        return toActionObject(action);
      });
      this.meta = this.config.meta;
      this.data = this.type === 'final' ? this.config.data : undefined;
      this.invoke = toArray(this.config.invoke).map(function (invokeConfig, i) {
        var _a, _b;

        if (isMachine(invokeConfig)) {
          _this.machine.options.services = __assign((_a = {}, _a[invokeConfig.id] = invokeConfig, _a), _this.machine.options.services);
          return {
            type: invoke,
            src: invokeConfig.id,
            id: invokeConfig.id
          };
        } else if (typeof invokeConfig.src !== 'string') {
          var invokeSrc = _this.id + ":invocation[" + i + "]"; // TODO: util function

          _this.machine.options.services = __assign((_b = {}, _b[invokeSrc] = invokeConfig.src, _b), _this.machine.options.services);
          return __assign(__assign({
            type: invoke,
            id: invokeSrc
          }, invokeConfig), {
            src: invokeSrc
          });
        } else {
          return __assign(__assign({}, invokeConfig), {
            type: invoke,
            id: invokeConfig.id || invokeConfig.src,
            src: invokeConfig.src
          });
        }
      });
      this.activities = toArray(this.config.activities).concat(this.invoke).map(function (activity) {
        return toActivityDefinition(activity);
      });
      this.transition = this.transition.bind(this);
    }

    StateNode.prototype._init = function () {
      if (this.__cache.transitions) {
        return;
      }

      getAllStateNodes(this).forEach(function (stateNode) {
        return stateNode.on;
      });
    };
    /**
     * Clones this state machine with custom options and context.
     *
     * @param options Options (actions, guards, activities, services) to recursively merge with the existing options.
     * @param context Custom context (will override predefined context)
     */


    StateNode.prototype.withConfig = function (options, context) {
      if (context === void 0) {
        context = this.context;
      }

      var _a = this.options,
          actions = _a.actions,
          activities = _a.activities,
          guards = _a.guards,
          services = _a.services,
          delays = _a.delays;
      return new StateNode(this.config, {
        actions: __assign(__assign({}, actions), options.actions),
        activities: __assign(__assign({}, activities), options.activities),
        guards: __assign(__assign({}, guards), options.guards),
        services: __assign(__assign({}, services), options.services),
        delays: __assign(__assign({}, delays), options.delays)
      }, context);
    };
    /**
     * Clones this state machine with custom context.
     *
     * @param context Custom context (will override predefined context, not recursive)
     */


    StateNode.prototype.withContext = function (context) {
      return new StateNode(this.config, this.options, context);
    };

    Object.defineProperty(StateNode.prototype, "definition", {
      /**
       * The well-structured state node definition.
       */
      get: function () {
        return {
          id: this.id,
          key: this.key,
          version: this.version,
          type: this.type,
          initial: this.initial,
          history: this.history,
          states: mapValues(this.states, function (state) {
            return state.definition;
          }),
          on: this.on,
          transitions: this.transitions,
          onEntry: this.onEntry,
          onExit: this.onExit,
          activities: this.activities || [],
          meta: this.meta,
          order: this.order || -1,
          data: this.data,
          invoke: this.invoke
        };
      },
      enumerable: true,
      configurable: true
    });

    StateNode.prototype.toJSON = function () {
      return this.definition;
    };

    Object.defineProperty(StateNode.prototype, "on", {
      /**
       * The mapping of events to transitions.
       */
      get: function () {
        if (this.__cache.on) {
          return this.__cache.on;
        }

        var transitions = this.transitions;
        return this.__cache.on = transitions.reduce(function (map, transition) {
          map[transition.eventType] = map[transition.eventType] || [];
          map[transition.eventType].push(transition);
          return map;
        }, {});
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(StateNode.prototype, "after", {
      get: function () {
        return this.__cache.delayedTransitions || (this.__cache.delayedTransitions = this.getDelayedTransitions(), this.__cache.delayedTransitions);
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(StateNode.prototype, "transitions", {
      /**
       * All the transitions that can be taken from this state node.
       */
      get: function () {
        return this.__cache.transitions || (this.__cache.transitions = this.formatTransitions(), this.__cache.transitions);
      },
      enumerable: true,
      configurable: true
    });

    StateNode.prototype.getCandidates = function (eventName) {
      if (this.__cache.candidates[eventName]) {
        return this.__cache.candidates[eventName];
      }

      var transient = eventName === NULL_EVENT;
      var candidates = this.transitions.filter(function (transition) {
        var sameEventType = transition.eventType === eventName; // null events should only match against eventless transitions

        return transient ? sameEventType : sameEventType || transition.eventType === WILDCARD;
      });
      this.__cache.candidates[eventName] = candidates;
      return candidates;
    };
    /**
     * All delayed transitions from the config.
     */


    StateNode.prototype.getDelayedTransitions = function () {
      var _this = this;

      var afterConfig = this.config.after;

      if (!afterConfig) {
        return [];
      }

      var mutateEntryExit = function (delay, i) {
        var delayRef = isFunction(delay) ? _this.id + ":delay[" + i + "]" : delay;
        var eventType = after$1(delayRef, _this.id);

        _this.onEntry.push(send$1(eventType, {
          delay: delay
        }));

        _this.onExit.push(cancel$1(eventType));

        return eventType;
      };

      var delayedTransitions = isArray(afterConfig) ? afterConfig.map(function (transition, i) {
        var eventType = mutateEntryExit(transition.delay, i);
        return __assign(__assign({}, transition), {
          event: eventType
        });
      }) : flatten(keys(afterConfig).map(function (delay, i) {
        var configTransition = afterConfig[delay];
        var resolvedTransition = isString(configTransition) ? {
          target: configTransition
        } : configTransition;
        var resolvedDelay = !isNaN(+delay) ? +delay : delay;
        var eventType = mutateEntryExit(resolvedDelay, i);
        return toArray(resolvedTransition).map(function (transition) {
          return __assign(__assign({}, transition), {
            event: eventType,
            delay: resolvedDelay
          });
        });
      }));
      return delayedTransitions.map(function (delayedTransition) {
        var delay = delayedTransition.delay;
        return __assign(__assign({}, _this.formatTransition(delayedTransition)), {
          delay: delay
        });
      });
    };
    /**
     * Returns the state nodes represented by the current state value.
     *
     * @param state The state value or State instance
     */


    StateNode.prototype.getStateNodes = function (state) {
      var _a;

      var _this = this;

      if (!state) {
        return [];
      }

      var stateValue = state instanceof State ? state.value : toStateValue(state, this.delimiter);

      if (isString(stateValue)) {
        var initialStateValue = this.getStateNode(stateValue).initial;
        return initialStateValue !== undefined ? this.getStateNodes((_a = {}, _a[stateValue] = initialStateValue, _a)) : [this.states[stateValue]];
      }

      var subStateKeys = keys(stateValue);
      var subStateNodes = subStateKeys.map(function (subStateKey) {
        return _this.getStateNode(subStateKey);
      });
      return subStateNodes.concat(subStateKeys.reduce(function (allSubStateNodes, subStateKey) {
        var subStateNode = _this.getStateNode(subStateKey).getStateNodes(stateValue[subStateKey]);

        return allSubStateNodes.concat(subStateNode);
      }, []));
    };
    /**
     * Returns `true` if this state node explicitly handles the given event.
     *
     * @param event The event in question
     */


    StateNode.prototype.handles = function (event) {
      var eventType = getEventType(event);
      return this.events.includes(eventType);
    };
    /**
     * Resolves the given `state` to a new `State` instance relative to this machine.
     *
     * This ensures that `.events` and `.nextEvents` represent the correct values.
     *
     * @param state The state to resolve
     */


    StateNode.prototype.resolveState = function (state) {
      var configuration = Array.from(getConfiguration([], this.getStateNodes(state.value)));
      return new State(__assign(__assign({}, state), {
        value: this.resolve(state.value),
        configuration: configuration
      }));
    };

    StateNode.prototype.transitionLeafNode = function (stateValue, state, _event) {
      var stateNode = this.getStateNode(stateValue);
      var next = stateNode.next(state, _event);

      if (!next || !next.transitions.length) {
        return this.next(state, _event);
      }

      return next;
    };

    StateNode.prototype.transitionCompoundNode = function (stateValue, state, _event) {
      var subStateKeys = keys(stateValue);
      var stateNode = this.getStateNode(subStateKeys[0]);

      var next = stateNode._transition(stateValue[subStateKeys[0]], state, _event);

      if (!next || !next.transitions.length) {
        return this.next(state, _event);
      }

      return next;
    };

    StateNode.prototype.transitionParallelNode = function (stateValue, state, _event) {
      var e_2, _a;

      var transitionMap = {};

      try {
        for (var _b = __values(keys(stateValue)), _c = _b.next(); !_c.done; _c = _b.next()) {
          var subStateKey = _c.value;
          var subStateValue = stateValue[subStateKey];

          if (!subStateValue) {
            continue;
          }

          var subStateNode = this.getStateNode(subStateKey);

          var next = subStateNode._transition(subStateValue, state, _event);

          if (next) {
            transitionMap[subStateKey] = next;
          }
        }
      } catch (e_2_1) {
        e_2 = {
          error: e_2_1
        };
      } finally {
        try {
          if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        } finally {
          if (e_2) throw e_2.error;
        }
      }

      var stateTransitions = keys(transitionMap).map(function (key) {
        return transitionMap[key];
      });
      var enabledTransitions = flatten(stateTransitions.map(function (st) {
        return st.transitions;
      }));
      var willTransition = stateTransitions.some(function (st) {
        return st.transitions.length > 0;
      });

      if (!willTransition) {
        return this.next(state, _event);
      }

      var entryNodes = flatten(stateTransitions.map(function (t) {
        return t.entrySet;
      }));
      var configuration = flatten(keys(transitionMap).map(function (key) {
        return transitionMap[key].configuration;
      }));
      return {
        transitions: enabledTransitions,
        entrySet: entryNodes,
        exitSet: flatten(stateTransitions.map(function (t) {
          return t.exitSet;
        })),
        configuration: configuration,
        source: state,
        actions: flatten(keys(transitionMap).map(function (key) {
          return transitionMap[key].actions;
        }))
      };
    };

    StateNode.prototype._transition = function (stateValue, state, _event) {
      // leaf node
      if (isString(stateValue)) {
        return this.transitionLeafNode(stateValue, state, _event);
      } // hierarchical node


      if (keys(stateValue).length === 1) {
        return this.transitionCompoundNode(stateValue, state, _event);
      } // orthogonal node


      return this.transitionParallelNode(stateValue, state, _event);
    };

    StateNode.prototype.next = function (state, _event) {
      var e_3, _a;

      var _this = this;

      var eventName = _event.name;
      var actions = [];
      var nextStateNodes = [];
      var selectedTransition;

      try {
        for (var _b = __values(this.getCandidates(eventName)), _c = _b.next(); !_c.done; _c = _b.next()) {
          var candidate = _c.value;
          var cond = candidate.cond,
              stateIn = candidate.in;
          var resolvedContext = state.context;
          var isInState = stateIn ? isString(stateIn) && isStateId(stateIn) ? // Check if in state by ID
          state.matches(toStateValue(this.getStateNodeById(stateIn).path, this.delimiter)) : // Check if in state by relative grandparent
          matchesState(toStateValue(stateIn, this.delimiter), path(this.path.slice(0, -2))(state.value)) : true;
          var guardPassed = false;

          try {
            guardPassed = !cond || this.evaluateGuard(cond, resolvedContext, _event, state);
          } catch (err) {
            throw new Error("Unable to evaluate guard '" + (cond.name || cond.type) + "' in transition for event '" + eventName + "' in state node '" + this.id + "':\n" + err.message);
          }

          if (guardPassed && isInState) {
            if (candidate.target !== undefined) {
              nextStateNodes = candidate.target;
            }

            actions.push.apply(actions, __spread(candidate.actions));
            selectedTransition = candidate;
            break;
          }
        }
      } catch (e_3_1) {
        e_3 = {
          error: e_3_1
        };
      } finally {
        try {
          if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        } finally {
          if (e_3) throw e_3.error;
        }
      }

      if (!selectedTransition) {
        return undefined;
      }

      if (!nextStateNodes.length) {
        return {
          transitions: [selectedTransition],
          entrySet: [],
          exitSet: [],
          configuration: state.value ? [this] : [],
          source: state,
          actions: actions
        };
      }

      var allNextStateNodes = flatten(nextStateNodes.map(function (stateNode) {
        return _this.getRelativeStateNodes(stateNode, state.historyValue);
      }));
      var isInternal = !!selectedTransition.internal;
      var reentryNodes = isInternal ? [] : flatten(allNextStateNodes.map(function (n) {
        return _this.nodesFromChild(n);
      }));
      return {
        transitions: [selectedTransition],
        entrySet: reentryNodes,
        exitSet: isInternal ? [] : [this],
        configuration: allNextStateNodes,
        source: state,
        actions: actions
      };
    };

    StateNode.prototype.nodesFromChild = function (childStateNode) {
      if (childStateNode.escapes(this)) {
        return [];
      }

      var nodes = [];
      var marker = childStateNode;

      while (marker && marker !== this) {
        nodes.push(marker);
        marker = marker.parent;
      }

      nodes.push(this); // inclusive

      return nodes;
    };
    /**
     * Whether the given state node "escapes" this state node. If the `stateNode` is equal to or the parent of
     * this state node, it does not escape.
     */


    StateNode.prototype.escapes = function (stateNode) {
      if (this === stateNode) {
        return false;
      }

      var parent = this.parent;

      while (parent) {
        if (parent === stateNode) {
          return false;
        }

        parent = parent.parent;
      }

      return true;
    };

    StateNode.prototype.evaluateGuard = function (guard, context, _event, state) {
      var guards = this.machine.options.guards;
      var guardMeta = {
        state: state,
        cond: guard,
        _event: _event
      }; // TODO: do not hardcode!

      if (guard.type === DEFAULT_GUARD_TYPE) {
        return guard.predicate(context, _event.data, guardMeta);
      }

      var condFn = guards[guard.type];

      if (!condFn) {
        throw new Error("Guard '" + guard.type + "' is not implemented on machine '" + this.machine.id + "'.");
      }

      return condFn(context, _event.data, guardMeta);
    };

    StateNode.prototype.getActions = function (transition, currentContext, _event, prevState) {
      var e_4, _a, e_5, _b;

      var prevConfig = getConfiguration([], prevState ? this.getStateNodes(prevState.value) : [this]);
      var resolvedConfig = transition.configuration.length ? getConfiguration(prevConfig, transition.configuration) : prevConfig;

      try {
        for (var resolvedConfig_1 = __values(resolvedConfig), resolvedConfig_1_1 = resolvedConfig_1.next(); !resolvedConfig_1_1.done; resolvedConfig_1_1 = resolvedConfig_1.next()) {
          var sn = resolvedConfig_1_1.value;

          if (!has(prevConfig, sn)) {
            transition.entrySet.push(sn);
          }
        }
      } catch (e_4_1) {
        e_4 = {
          error: e_4_1
        };
      } finally {
        try {
          if (resolvedConfig_1_1 && !resolvedConfig_1_1.done && (_a = resolvedConfig_1.return)) _a.call(resolvedConfig_1);
        } finally {
          if (e_4) throw e_4.error;
        }
      }

      try {
        for (var prevConfig_1 = __values(prevConfig), prevConfig_1_1 = prevConfig_1.next(); !prevConfig_1_1.done; prevConfig_1_1 = prevConfig_1.next()) {
          var sn = prevConfig_1_1.value;

          if (!has(resolvedConfig, sn) || has(transition.exitSet, sn.parent)) {
            transition.exitSet.push(sn);
          }
        }
      } catch (e_5_1) {
        e_5 = {
          error: e_5_1
        };
      } finally {
        try {
          if (prevConfig_1_1 && !prevConfig_1_1.done && (_b = prevConfig_1.return)) _b.call(prevConfig_1);
        } finally {
          if (e_5) throw e_5.error;
        }
      }

      if (!transition.source) {
        transition.exitSet = []; // Ensure that root StateNode (machine) is entered

        transition.entrySet.push(this);
      }

      var doneEvents = flatten(transition.entrySet.map(function (sn) {
        var events = [];

        if (sn.type !== 'final') {
          return events;
        }

        var parent = sn.parent;
        events.push(done(sn.id, sn.data), // TODO: deprecate - final states should not emit done events for their own state.
        done(parent.id, sn.data ? mapContext(sn.data, currentContext, _event) : undefined));

        if (parent.parent) {
          var grandparent = parent.parent;

          if (grandparent.type === 'parallel') {
            if (getChildren(grandparent).every(function (parentNode) {
              return isInFinalState(transition.configuration, parentNode);
            })) {
              events.push(done(grandparent.id, grandparent.data));
            }
          }
        }

        return events;
      }));
      transition.exitSet.sort(function (a, b) {
        return b.order - a.order;
      });
      transition.entrySet.sort(function (a, b) {
        return a.order - b.order;
      });
      var entryStates = new Set(transition.entrySet);
      var exitStates = new Set(transition.exitSet);

      var _c = __read([flatten(Array.from(entryStates).map(function (stateNode) {
        return __spread(stateNode.activities.map(function (activity) {
          return start$1(activity);
        }), stateNode.onEntry);
      })).concat(doneEvents.map(raise$1)), flatten(Array.from(exitStates).map(function (stateNode) {
        return __spread(stateNode.onExit, stateNode.activities.map(function (activity) {
          return stop$1(activity);
        }));
      }))], 2),
          entryActions = _c[0],
          exitActions = _c[1];

      var actions = toActionObjects(exitActions.concat(transition.actions).concat(entryActions), this.machine.options.actions);
      return actions;
    };
    /**
     * Determines the next state given the current `state` and sent `event`.
     *
     * @param state The current State instance or state value
     * @param event The event that was sent at the current state
     * @param context The current context (extended state) of the current state
     */


    StateNode.prototype.transition = function (state, event, context) {
      if (state === void 0) {
        state = this.initialState;
      }

      var _event = toSCXMLEvent(event);

      var currentState;

      if (state instanceof State) {
        currentState = context === undefined ? state : this.resolveState(State.from(state, context));
      } else {
        var resolvedStateValue = isString(state) ? this.resolve(pathToStateValue(this.getResolvedPath(state))) : this.resolve(state);
        var resolvedContext = context ? context : this.machine.context;
        currentState = this.resolveState(State.from(resolvedStateValue, resolvedContext));
      }

      if (!IS_PRODUCTION && _event.name === WILDCARD) {
        throw new Error("An event cannot have the wildcard type ('" + WILDCARD + "')");
      }

      if (this.strict) {
        if (!this.events.includes(_event.name) && !isBuiltInEvent(_event.name)) {
          throw new Error("Machine '" + this.id + "' does not accept event '" + _event.name + "'");
        }
      }

      var stateTransition = this._transition(currentState.value, currentState, _event) || {
        transitions: [],
        configuration: [],
        entrySet: [],
        exitSet: [],
        source: currentState,
        actions: []
      };
      var prevConfig = getConfiguration([], this.getStateNodes(currentState.value));
      var resolvedConfig = stateTransition.configuration.length ? getConfiguration(prevConfig, stateTransition.configuration) : prevConfig;
      stateTransition.configuration = __spread(resolvedConfig);
      return this.resolveTransition(stateTransition, currentState, _event);
    };

    StateNode.prototype.resolveRaisedTransition = function (state, _event, originalEvent) {
      var _a;

      var currentActions = state.actions;
      state = this.transition(state, _event); // Save original event to state

      state._event = originalEvent;
      state.event = originalEvent.data;

      (_a = state.actions).unshift.apply(_a, __spread(currentActions));

      return state;
    };

    StateNode.prototype.resolveTransition = function (stateTransition, currentState, _event, context) {
      var e_6, _a;

      var _this = this;

      if (_event === void 0) {
        _event = initEvent;
      }

      if (context === void 0) {
        context = this.machine.context;
      }

      var configuration = stateTransition.configuration; // Transition will "apply" if:
      // - this is the initial state (there is no current state)
      // - OR there are transitions

      var willTransition = !currentState || stateTransition.transitions.length > 0;
      var resolvedStateValue = willTransition ? getValue(this.machine, configuration) : undefined;
      var historyValue = currentState ? currentState.historyValue ? currentState.historyValue : stateTransition.source ? this.machine.historyValue(currentState.value) : undefined : undefined;
      var currentContext = currentState ? currentState.context : context;
      var actions = this.getActions(stateTransition, currentContext, _event, currentState);
      var activities = currentState ? __assign({}, currentState.activities) : {};

      try {
        for (var actions_1 = __values(actions), actions_1_1 = actions_1.next(); !actions_1_1.done; actions_1_1 = actions_1.next()) {
          var action = actions_1_1.value;

          if (action.type === start) {
            activities[action.activity.type] = action;
          } else if (action.type === stop) {
            activities[action.activity.type] = false;
          }
        }
      } catch (e_6_1) {
        e_6 = {
          error: e_6_1
        };
      } finally {
        try {
          if (actions_1_1 && !actions_1_1.done && (_a = actions_1.return)) _a.call(actions_1);
        } finally {
          if (e_6) throw e_6.error;
        }
      }

      var _b = __read(partition(actions, function (action) {
        return action.type === assign;
      }), 2),
          assignActions = _b[0],
          otherActions = _b[1];

      var updatedContext = assignActions.length ? updateContext(currentContext, _event, assignActions, currentState) : currentContext;
      var resolvedActions = flatten(otherActions.map(function (actionObject) {
        switch (actionObject.type) {
          case raise:
            return resolveRaise(actionObject);

          case send:
            var sendAction = resolveSend(actionObject, updatedContext, _event, _this.machine.options.delays); // TODO: fix ActionTypes.Init

            if (!IS_PRODUCTION) {
              // warn after resolving as we can create better contextual message here
              warn(!isString(actionObject.delay) || typeof sendAction.delay === 'number', // tslint:disable-next-line:max-line-length
              "No delay reference for delay expression '" + actionObject.delay + "' was found on machine '" + _this.machine.id + "'");
            }

            return sendAction;

          case log:
            return resolveLog(actionObject, updatedContext, _event);

          case pure:
            return actionObject.get(updatedContext, _event.data) || [];

          default:
            return toActionObject(actionObject, _this.options.actions);
        }
      }));

      var _c = __read(partition(resolvedActions, function (action) {
        return action.type === raise || action.type === send && action.to === SpecialTargets.Internal;
      }), 2),
          raisedEvents = _c[0],
          nonRaisedActions = _c[1];

      var invokeActions = resolvedActions.filter(function (action) {
        return action.type === start && action.activity.type === invoke;
      });
      var children = invokeActions.reduce(function (acc, action) {
        acc[action.activity.id] = createInvocableActor(action.activity);
        return acc;
      }, currentState ? __assign({}, currentState.children) : {});
      var resolvedConfiguration = resolvedStateValue ? stateTransition.configuration : currentState ? currentState.configuration : [];
      var meta = resolvedConfiguration.reduce(function (acc, stateNode) {
        if (stateNode.meta !== undefined) {
          acc[stateNode.id] = stateNode.meta;
        }

        return acc;
      }, {});
      var isDone = isInFinalState(resolvedConfiguration, this);
      var nextState = new State({
        value: resolvedStateValue || currentState.value,
        context: updatedContext,
        _event: _event,
        // Persist _sessionid between states
        _sessionid: currentState ? currentState._sessionid : null,
        historyValue: resolvedStateValue ? historyValue ? updateHistoryValue(historyValue, resolvedStateValue) : undefined : currentState ? currentState.historyValue : undefined,
        history: !resolvedStateValue || stateTransition.source ? currentState : undefined,
        actions: resolvedStateValue ? nonRaisedActions : [],
        activities: resolvedStateValue ? activities : currentState ? currentState.activities : {},
        meta: resolvedStateValue ? meta : currentState ? currentState.meta : undefined,
        events: [],
        configuration: resolvedConfiguration,
        transitions: stateTransition.transitions,
        children: children,
        done: isDone
      });
      nextState.changed = _event.name === update || !!assignActions.length; // Dispose of penultimate histories to prevent memory leaks

      var history = nextState.history;

      if (history) {
        delete history.history;
      }

      if (!resolvedStateValue) {
        return nextState;
      }

      var maybeNextState = nextState;

      if (!isDone) {
        var isTransient = this._transient || configuration.some(function (stateNode) {
          return stateNode._transient;
        });

        if (isTransient) {
          maybeNextState = this.resolveRaisedTransition(maybeNextState, {
            type: nullEvent
          }, _event);
        }

        while (raisedEvents.length) {
          var raisedEvent = raisedEvents.shift();
          maybeNextState = this.resolveRaisedTransition(maybeNextState, raisedEvent._event, _event);
        }
      } // Detect if state changed


      var changed = maybeNextState.changed || (history ? !!maybeNextState.actions.length || !!assignActions.length || typeof history.value !== typeof maybeNextState.value || !stateValuesEqual(maybeNextState.value, history.value) : undefined);
      maybeNextState.changed = changed; // Preserve original history after raised events

      maybeNextState.historyValue = nextState.historyValue;
      maybeNextState.history = history;
      return maybeNextState;
    };
    /**
     * Returns the child state node from its relative `stateKey`, or throws.
     */


    StateNode.prototype.getStateNode = function (stateKey) {
      if (isStateId(stateKey)) {
        return this.machine.getStateNodeById(stateKey);
      }

      if (!this.states) {
        throw new Error("Unable to retrieve child state '" + stateKey + "' from '" + this.id + "'; no child states exist.");
      }

      var result = this.states[stateKey];

      if (!result) {
        throw new Error("Child state '" + stateKey + "' does not exist on '" + this.id + "'");
      }

      return result;
    };
    /**
     * Returns the state node with the given `stateId`, or throws.
     *
     * @param stateId The state ID. The prefix "#" is removed.
     */


    StateNode.prototype.getStateNodeById = function (stateId) {
      var resolvedStateId = isStateId(stateId) ? stateId.slice(STATE_IDENTIFIER.length) : stateId;

      if (resolvedStateId === this.id) {
        return this;
      }

      var stateNode = this.machine.idMap[resolvedStateId];

      if (!stateNode) {
        throw new Error("Child state node '#" + resolvedStateId + "' does not exist on machine '" + this.id + "'");
      }

      return stateNode;
    };
    /**
     * Returns the relative state node from the given `statePath`, or throws.
     *
     * @param statePath The string or string array relative path to the state node.
     */


    StateNode.prototype.getStateNodeByPath = function (statePath) {
      if (typeof statePath === 'string' && isStateId(statePath)) {
        try {
          return this.getStateNodeById(statePath.slice(1));
        } catch (e) {// try individual paths
          // throw e;
        }
      }

      var arrayStatePath = toStatePath(statePath, this.delimiter).slice();
      var currentStateNode = this;

      while (arrayStatePath.length) {
        var key = arrayStatePath.shift();

        if (!key.length) {
          break;
        }

        currentStateNode = currentStateNode.getStateNode(key);
      }

      return currentStateNode;
    };
    /**
     * Resolves a partial state value with its full representation in this machine.
     *
     * @param stateValue The partial state value to resolve.
     */


    StateNode.prototype.resolve = function (stateValue) {
      var _a;

      var _this = this;

      if (!stateValue) {
        return this.initialStateValue || EMPTY_OBJECT; // TODO: type-specific properties
      }

      switch (this.type) {
        case 'parallel':
          return mapValues(this.initialStateValue, function (subStateValue, subStateKey) {
            return subStateValue ? _this.getStateNode(subStateKey).resolve(stateValue[subStateKey] || subStateValue) : EMPTY_OBJECT;
          });

        case 'compound':
          if (isString(stateValue)) {
            var subStateNode = this.getStateNode(stateValue);

            if (subStateNode.type === 'parallel' || subStateNode.type === 'compound') {
              return _a = {}, _a[stateValue] = subStateNode.initialStateValue, _a;
            }

            return stateValue;
          }

          if (!keys(stateValue).length) {
            return this.initialStateValue || {};
          }

          return mapValues(stateValue, function (subStateValue, subStateKey) {
            return subStateValue ? _this.getStateNode(subStateKey).resolve(subStateValue) : EMPTY_OBJECT;
          });

        default:
          return stateValue || EMPTY_OBJECT;
      }
    };

    StateNode.prototype.getResolvedPath = function (stateIdentifier) {
      if (isStateId(stateIdentifier)) {
        var stateNode = this.machine.idMap[stateIdentifier.slice(STATE_IDENTIFIER.length)];

        if (!stateNode) {
          throw new Error("Unable to find state node '" + stateIdentifier + "'");
        }

        return stateNode.path;
      }

      return toStatePath(stateIdentifier, this.delimiter);
    };

    Object.defineProperty(StateNode.prototype, "initialStateValue", {
      get: function () {
        var _a;

        if (this.__cache.initialStateValue) {
          return this.__cache.initialStateValue;
        }

        var initialStateValue;

        if (this.type === 'parallel') {
          initialStateValue = mapFilterValues(this.states, function (state) {
            return state.initialStateValue || EMPTY_OBJECT;
          }, function (stateNode) {
            return !(stateNode.type === 'history');
          });
        } else if (this.initial !== undefined) {
          if (!this.states[this.initial]) {
            throw new Error("Initial state '" + this.initial + "' not found on '" + this.key + "'");
          }

          initialStateValue = isLeafNode(this.states[this.initial]) ? this.initial : (_a = {}, _a[this.initial] = this.states[this.initial].initialStateValue, _a);
        }

        this.__cache.initialStateValue = initialStateValue;
        return this.__cache.initialStateValue;
      },
      enumerable: true,
      configurable: true
    });

    StateNode.prototype.getInitialState = function (stateValue, context) {
      var configuration = this.getStateNodes(stateValue);
      return this.resolveTransition({
        configuration: configuration,
        entrySet: configuration,
        exitSet: [],
        transitions: [],
        source: undefined,
        actions: []
      }, undefined, undefined, context);
    };

    Object.defineProperty(StateNode.prototype, "initialState", {
      /**
       * The initial State instance, which includes all actions to be executed from
       * entering the initial state.
       */
      get: function () {
        this._init();

        var initialStateValue = this.initialStateValue;

        if (!initialStateValue) {
          throw new Error("Cannot retrieve initial state from simple state '" + this.id + "'.");
        }

        return this.getInitialState(initialStateValue);
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(StateNode.prototype, "target", {
      /**
       * The target state value of the history state node, if it exists. This represents the
       * default state value to transition to if no history value exists yet.
       */
      get: function () {
        var target;

        if (this.type === 'history') {
          var historyConfig = this.config;

          if (isString(historyConfig.target)) {
            target = isStateId(historyConfig.target) ? pathToStateValue(this.machine.getStateNodeById(historyConfig.target).path.slice(this.path.length - 1)) : historyConfig.target;
          } else {
            target = historyConfig.target;
          }
        }

        return target;
      },
      enumerable: true,
      configurable: true
    });
    /**
     * Returns the leaf nodes from a state path relative to this state node.
     *
     * @param relativeStateId The relative state path to retrieve the state nodes
     * @param history The previous state to retrieve history
     * @param resolve Whether state nodes should resolve to initial child state nodes
     */

    StateNode.prototype.getRelativeStateNodes = function (relativeStateId, historyValue, resolve) {
      if (resolve === void 0) {
        resolve = true;
      }

      return resolve ? relativeStateId.type === 'history' ? relativeStateId.resolveHistory(historyValue) : relativeStateId.initialStateNodes : [relativeStateId];
    };

    Object.defineProperty(StateNode.prototype, "initialStateNodes", {
      get: function () {
        var _this = this;

        if (isLeafNode(this)) {
          return [this];
        } // Case when state node is compound but no initial state is defined


        if (this.type === 'compound' && !this.initial) {
          if (!IS_PRODUCTION) {
            warn(false, "Compound state node '" + this.id + "' has no initial state.");
          }

          return [this];
        }

        var initialStateNodePaths = toStatePaths(this.initialStateValue);
        return flatten(initialStateNodePaths.map(function (initialPath) {
          return _this.getFromRelativePath(initialPath);
        }));
      },
      enumerable: true,
      configurable: true
    });
    /**
     * Retrieves state nodes from a relative path to this state node.
     *
     * @param relativePath The relative path from this state node
     * @param historyValue
     */

    StateNode.prototype.getFromRelativePath = function (relativePath) {
      if (!relativePath.length) {
        return [this];
      }

      var _a = __read(relativePath),
          stateKey = _a[0],
          childStatePath = _a.slice(1);

      if (!this.states) {
        throw new Error("Cannot retrieve subPath '" + stateKey + "' from node with no states");
      }

      var childStateNode = this.getStateNode(stateKey);

      if (childStateNode.type === 'history') {
        return childStateNode.resolveHistory();
      }

      if (!this.states[stateKey]) {
        throw new Error("Child state '" + stateKey + "' does not exist on '" + this.id + "'");
      }

      return this.states[stateKey].getFromRelativePath(childStatePath);
    };

    StateNode.prototype.historyValue = function (relativeStateValue) {
      if (!keys(this.states).length) {
        return undefined;
      }

      return {
        current: relativeStateValue || this.initialStateValue,
        states: mapFilterValues(this.states, function (stateNode, key) {
          if (!relativeStateValue) {
            return stateNode.historyValue();
          }

          var subStateValue = isString(relativeStateValue) ? undefined : relativeStateValue[key];
          return stateNode.historyValue(subStateValue || stateNode.initialStateValue);
        }, function (stateNode) {
          return !stateNode.history;
        })
      };
    };
    /**
     * Resolves to the historical value(s) of the parent state node,
     * represented by state nodes.
     *
     * @param historyValue
     */


    StateNode.prototype.resolveHistory = function (historyValue) {
      var _this = this;

      if (this.type !== 'history') {
        return [this];
      }

      var parent = this.parent;

      if (!historyValue) {
        var historyTarget = this.target;
        return historyTarget ? flatten(toStatePaths(historyTarget).map(function (relativeChildPath) {
          return parent.getFromRelativePath(relativeChildPath);
        })) : parent.initialStateNodes;
      }

      var subHistoryValue = nestedPath(parent.path, 'states')(historyValue).current;

      if (isString(subHistoryValue)) {
        return [parent.getStateNode(subHistoryValue)];
      }

      return flatten(toStatePaths(subHistoryValue).map(function (subStatePath) {
        return _this.history === 'deep' ? parent.getFromRelativePath(subStatePath) : [parent.states[subStatePath[0]]];
      }));
    };

    Object.defineProperty(StateNode.prototype, "stateIds", {
      /**
       * All the state node IDs of this state node and its descendant state nodes.
       */
      get: function () {
        var _this = this;

        var childStateIds = flatten(keys(this.states).map(function (stateKey) {
          return _this.states[stateKey].stateIds;
        }));
        return [this.id].concat(childStateIds);
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(StateNode.prototype, "events", {
      /**
       * All the event types accepted by this state node and its descendants.
       */
      get: function () {
        var e_7, _a, e_8, _b;

        if (this.__cache.events) {
          return this.__cache.events;
        }

        var states = this.states;
        var events = new Set(this.ownEvents);

        if (states) {
          try {
            for (var _c = __values(keys(states)), _d = _c.next(); !_d.done; _d = _c.next()) {
              var stateId = _d.value;
              var state = states[stateId];

              if (state.states) {
                try {
                  for (var _e = (e_8 = void 0, __values(state.events)), _f = _e.next(); !_f.done; _f = _e.next()) {
                    var event_1 = _f.value;
                    events.add("" + event_1);
                  }
                } catch (e_8_1) {
                  e_8 = {
                    error: e_8_1
                  };
                } finally {
                  try {
                    if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                  } finally {
                    if (e_8) throw e_8.error;
                  }
                }
              }
            }
          } catch (e_7_1) {
            e_7 = {
              error: e_7_1
            };
          } finally {
            try {
              if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            } finally {
              if (e_7) throw e_7.error;
            }
          }
        }

        return this.__cache.events = Array.from(events);
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(StateNode.prototype, "ownEvents", {
      /**
       * All the events that have transitions directly from this state node.
       *
       * Excludes any inert events.
       */
      get: function () {
        var events = new Set(this.transitions.filter(function (transition) {
          return !(!transition.target && !transition.actions.length && transition.internal);
        }).map(function (transition) {
          return transition.eventType;
        }));
        return Array.from(events);
      },
      enumerable: true,
      configurable: true
    });

    StateNode.prototype.resolveTarget = function (_target) {
      var _this = this;

      if (_target === undefined) {
        // an undefined target signals that the state node should not transition from that state when receiving that event
        return undefined;
      }

      return _target.map(function (target) {
        if (!isString(target)) {
          return target;
        }

        var isInternalTarget = target[0] === _this.delimiter; // If internal target is defined on machine,
        // do not include machine key on target

        if (isInternalTarget && !_this.parent) {
          return _this.getStateNodeByPath(target.slice(1));
        }

        var resolvedTarget = isInternalTarget ? _this.key + target : target;

        if (_this.parent) {
          try {
            var targetStateNode = _this.parent.getStateNodeByPath(resolvedTarget);

            return targetStateNode;
          } catch (err) {
            throw new Error("Invalid transition definition for state node '" + _this.id + "':\n" + err.message);
          }
        } else {
          return _this.getStateNodeByPath(resolvedTarget);
        }
      });
    };

    StateNode.prototype.formatTransition = function (transitionConfig) {
      var _this = this;

      var normalizedTarget = normalizeTarget(transitionConfig.target);
      var internal = 'internal' in transitionConfig ? transitionConfig.internal : normalizedTarget ? normalizedTarget.some(function (_target) {
        return isString(_target) && _target[0] === _this.delimiter;
      }) : true;
      var guards = this.machine.options.guards;
      var target = this.resolveTarget(normalizedTarget);
      return __assign(__assign({}, transitionConfig), {
        actions: toActionObjects(toArray(transitionConfig.actions)),
        cond: toGuard(transitionConfig.cond, guards),
        target: target,
        source: this,
        internal: internal,
        eventType: transitionConfig.event
      });
    };

    StateNode.prototype.formatTransitions = function () {
      var e_9, _a;

      var _this = this;

      var onConfig;

      if (!this.config.on) {
        onConfig = [];
      } else if (Array.isArray(this.config.on)) {
        onConfig = this.config.on;
      } else {
        var _b = this.config.on,
            _c = WILDCARD,
            _d = _b[_c],
            wildcardConfigs = _d === void 0 ? [] : _d,
            strictOnConfigs_1 = __rest(_b, [typeof _c === "symbol" ? _c : _c + ""]);

        onConfig = flatten(keys(strictOnConfigs_1).map(function (key) {
          var arrayified = toTransitionConfigArray(key, strictOnConfigs_1[key]);

          if (!IS_PRODUCTION) {
            validateArrayifiedTransitions(_this, key, arrayified);
          }

          return arrayified;
        }).concat(toTransitionConfigArray(WILDCARD, wildcardConfigs)));
      }

      var doneConfig = this.config.onDone ? toTransitionConfigArray(String(done(this.id)), this.config.onDone) : [];
      var invokeConfig = flatten(this.invoke.map(function (invokeDef) {
        var settleTransitions = [];

        if (invokeDef.onDone) {
          settleTransitions.push.apply(settleTransitions, __spread(toTransitionConfigArray(String(doneInvoke(invokeDef.id)), invokeDef.onDone)));
        }

        if (invokeDef.onError) {
          settleTransitions.push.apply(settleTransitions, __spread(toTransitionConfigArray(String(error$1(invokeDef.id)), invokeDef.onError)));
        }

        return settleTransitions;
      }));
      var delayedTransitions = this.after;
      var formattedTransitions = flatten(__spread(doneConfig, invokeConfig, onConfig).map(function (transitionConfig) {
        return toArray(transitionConfig).map(function (transition) {
          return _this.formatTransition(transition);
        });
      }));

      try {
        for (var delayedTransitions_1 = __values(delayedTransitions), delayedTransitions_1_1 = delayedTransitions_1.next(); !delayedTransitions_1_1.done; delayedTransitions_1_1 = delayedTransitions_1.next()) {
          var delayedTransition = delayedTransitions_1_1.value;
          formattedTransitions.push(delayedTransition);
        }
      } catch (e_9_1) {
        e_9 = {
          error: e_9_1
        };
      } finally {
        try {
          if (delayedTransitions_1_1 && !delayedTransitions_1_1.done && (_a = delayedTransitions_1.return)) _a.call(delayedTransitions_1);
        } finally {
          if (e_9) throw e_9.error;
        }
      }

      return formattedTransitions;
    };

    return StateNode;
  }();

  function Machine(config, options, initialContext) {
    if (initialContext === void 0) {
      initialContext = config.context;
    }

    var resolvedInitialContext = typeof initialContext === 'function' ? initialContext() : initialContext;
    return new StateNode(config, options, resolvedInitialContext);
  }

  var defaultOptions = {
    deferEvents: false
  };

  var Scheduler =
  /*#__PURE__*/

  /** @class */
  function () {
    function Scheduler(options) {
      this.processingEvent = false;
      this.queue = [];
      this.initialized = false;
      this.options = __assign(__assign({}, defaultOptions), options);
    }

    Scheduler.prototype.initialize = function (callback) {
      this.initialized = true;

      if (callback) {
        if (!this.options.deferEvents) {
          this.schedule(callback);
          return;
        }

        this.process(callback);
      }

      this.flushEvents();
    };

    Scheduler.prototype.schedule = function (task) {
      if (!this.initialized || this.processingEvent) {
        this.queue.push(task);
        return;
      }

      if (this.queue.length !== 0) {
        throw new Error('Event queue should be empty when it is not processing events');
      }

      this.process(task);
      this.flushEvents();
    };

    Scheduler.prototype.clear = function () {
      this.queue = [];
    };

    Scheduler.prototype.flushEvents = function () {
      var nextCallback = this.queue.shift();

      while (nextCallback) {
        this.process(nextCallback);
        nextCallback = this.queue.shift();
      }
    };

    Scheduler.prototype.process = function (callback) {
      this.processingEvent = true;

      try {
        callback();
      } catch (e) {
        // there is no use to keep the future events
        // as the situation is not anymore the same
        this.clear();
        throw e;
      } finally {
        this.processingEvent = false;
      }
    };

    return Scheduler;
  }();

  var children =
  /*#__PURE__*/
  new Map();
  var idMap =
  /*#__PURE__*/
  new Map();
  var sessionIdIndex = 0;
  var registry = {
    register: function (actor) {
      var id = "x:" + sessionIdIndex++;
      children.set(id, actor);
      idMap.set(actor, id);
      return id;
    },
    get: function (id) {
      return children.get(id);
    },
    lookup: function (actorRef) {
      return idMap.get(actorRef);
    }
  };

  function getDevTools() {
    var w = window;

    if (!!w.__xstate__) {
      return w.__xstate__;
    }

    return undefined;
  }

  function registerService(service) {
    if (IS_PRODUCTION || typeof window === 'undefined') {
      return;
    }

    var devTools = getDevTools();

    if (devTools) {
      devTools.register(service);
    }
  }

  var DEFAULT_SPAWN_OPTIONS = {
    sync: false,
    autoForward: false
  };
  /**
   * Maintains a stack of the current service in scope.
   * This is used to provide the correct service to spawn().
   *
   * @private
   */

  var withServiceScope =
  /*#__PURE__*/
  function () {
    var serviceStack = [];
    return function (service, fn) {
      service && serviceStack.push(service);
      var result = fn(service || serviceStack[serviceStack.length - 1]);
      service && serviceStack.pop();
      return result;
    };
  }();

  var InterpreterStatus;

  (function (InterpreterStatus) {
    InterpreterStatus[InterpreterStatus["NotStarted"] = 0] = "NotStarted";
    InterpreterStatus[InterpreterStatus["Running"] = 1] = "Running";
    InterpreterStatus[InterpreterStatus["Stopped"] = 2] = "Stopped";
  })(InterpreterStatus || (InterpreterStatus = {}));

  var Interpreter =
  /*#__PURE__*/

  /** @class */
  function () {
    /**
     * Creates a new Interpreter instance (i.e., service) for the given machine with the provided options, if any.
     *
     * @param machine The machine to be interpreted
     * @param options Interpreter options
     */
    function Interpreter(machine, options, sessionId) {
      var _this = this;

      if (options === void 0) {
        options = Interpreter.defaultOptions;
      }

      this.machine = machine;
      this.scheduler = new Scheduler();
      this.delayedEventsMap = {};
      this.listeners = new Set();
      this.contextListeners = new Set();
      this.stopListeners = new Set();
      this.doneListeners = new Set();
      this.eventListeners = new Set();
      this.sendListeners = new Set();
      /**
       * Whether the service is started.
       */

      this.initialized = false;
      this._status = InterpreterStatus.NotStarted;
      this.children = new Map();
      this.forwardTo = new Set();
      /**
       * Alias for Interpreter.prototype.start
       */

      this.init = this.start;
      /**
       * Sends an event to the running interpreter to trigger a transition.
       *
       * An array of events (batched) can be sent as well, which will send all
       * batched events to the running interpreter. The listeners will be
       * notified only **once** when all events are processed.
       *
       * @param event The event(s) to send
       */

      this.send = function (event, payload) {
        if (isArray(event)) {
          _this.batch(event);

          return _this.state;
        }

        var _event = toSCXMLEvent(toEventObject(event, payload));

        if (_this._status === InterpreterStatus.Stopped) {
          // do nothing
          if (!IS_PRODUCTION) {
            warn(false, "Event \"" + _event.name + "\" was sent to stopped service \"" + _this.machine.id + "\". This service has already reached its final state, and will not transition.\nEvent: " + JSON.stringify(_event.data));
          }

          return _this.state;
        }

        if (_this._status === InterpreterStatus.NotStarted && _this.options.deferEvents) {
          // tslint:disable-next-line:no-console
          if (!IS_PRODUCTION) {
            warn(false, "Event \"" + _event.name + "\" was sent to uninitialized service \"" + _this.machine.id + "\" and is deferred. Make sure .start() is called for this service.\nEvent: " + JSON.stringify(_event.data));
          }
        } else if (_this._status !== InterpreterStatus.Running) {
          throw new Error("Event \"" + _event.name + "\" was sent to uninitialized service \"" + _this.machine.id + "\". Make sure .start() is called for this service, or set { deferEvents: true } in the service options.\nEvent: " + JSON.stringify(_event.data));
        }

        _this.scheduler.schedule(function () {
          // Forward copy of event to child actors
          _this.forward(_event);

          var nextState = _this.nextState(_event);

          _this.update(nextState, _event);
        });

        return _this._state; // TODO: deprecate (should return void)
        // tslint:disable-next-line:semicolon
      };

      this.sendTo = function (event, to) {
        var isParent = _this.parent && (to === SpecialTargets.Parent || _this.parent.id === to);
        var target = isParent ? _this.parent : isActor(to) ? to : _this.children.get(to) || registry.get(to);

        if (!target) {
          if (!isParent) {
            throw new Error("Unable to send event to child '" + to + "' from service '" + _this.id + "'.");
          } // tslint:disable-next-line:no-console


          if (!IS_PRODUCTION) {
            warn(false, "Service '" + _this.id + "' has no parent: unable to send event " + event.type);
          }

          return;
        }

        if ('machine' in target) {
          // Send SCXML events to machines
          target.send(__assign(__assign({}, event), {
            name: event.name === error ? "" + error$1(_this.id) : event.name,
            origin: _this.sessionId
          }));
        } else {
          // Send normal events to other targets
          target.send(event.data);
        }
      };

      var resolvedOptions = __assign(__assign({}, Interpreter.defaultOptions), options);

      var clock = resolvedOptions.clock,
          logger = resolvedOptions.logger,
          parent = resolvedOptions.parent,
          id = resolvedOptions.id;
      var resolvedId = id !== undefined ? id : machine.id;
      this.id = resolvedId;
      this.logger = logger;
      this.clock = clock;
      this.parent = parent;
      this.options = resolvedOptions;
      this.scheduler = new Scheduler({
        deferEvents: this.options.deferEvents
      });
      this.sessionId = sessionId !== undefined ? sessionId : registry.register(this);
    }

    Object.defineProperty(Interpreter.prototype, "initialState", {
      get: function () {
        var _this = this;

        if (this._initialState) {
          return this._initialState;
        }

        return withServiceScope(this, function () {
          _this._initialState = _this.machine.initialState;
          return _this._initialState;
        });
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(Interpreter.prototype, "state", {
      get: function () {
        if (!IS_PRODUCTION) {
          warn(this._status !== InterpreterStatus.NotStarted, "Attempted to read state from uninitialized service '" + this.id + "'. Make sure the service is started first.");
        }

        return this._state;
      },
      enumerable: true,
      configurable: true
    });
    /**
     * Executes the actions of the given state, with that state's `context` and `event`.
     *
     * @param state The state whose actions will be executed
     * @param actionsConfig The action implementations to use
     */

    Interpreter.prototype.execute = function (state, actionsConfig) {
      var e_1, _a;

      try {
        for (var _b = __values(state.actions), _c = _b.next(); !_c.done; _c = _b.next()) {
          var action = _c.value;
          this.exec(action, state, actionsConfig);
        }
      } catch (e_1_1) {
        e_1 = {
          error: e_1_1
        };
      } finally {
        try {
          if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        } finally {
          if (e_1) throw e_1.error;
        }
      }
    };

    Interpreter.prototype.update = function (state, _event) {
      var e_2, _a, e_3, _b, e_4, _c, e_5, _d;

      var _this = this; // Attach session ID to state


      state._sessionid = this.sessionId; // Update state

      this._state = state; // Execute actions

      if (this.options.execute) {
        this.execute(this.state);
      } // Dev tools


      if (this.devTools) {
        this.devTools.send(_event.data, state);
      } // Execute listeners


      if (state.event) {
        try {
          for (var _e = __values(this.eventListeners), _f = _e.next(); !_f.done; _f = _e.next()) {
            var listener = _f.value;
            listener(state.event);
          }
        } catch (e_2_1) {
          e_2 = {
            error: e_2_1
          };
        } finally {
          try {
            if (_f && !_f.done && (_a = _e.return)) _a.call(_e);
          } finally {
            if (e_2) throw e_2.error;
          }
        }
      }

      try {
        for (var _g = __values(this.listeners), _h = _g.next(); !_h.done; _h = _g.next()) {
          var listener = _h.value;
          listener(state, state.event);
        }
      } catch (e_3_1) {
        e_3 = {
          error: e_3_1
        };
      } finally {
        try {
          if (_h && !_h.done && (_b = _g.return)) _b.call(_g);
        } finally {
          if (e_3) throw e_3.error;
        }
      }

      try {
        for (var _j = __values(this.contextListeners), _k = _j.next(); !_k.done; _k = _j.next()) {
          var contextListener = _k.value;
          contextListener(this.state.context, this.state.history ? this.state.history.context : undefined);
        }
      } catch (e_4_1) {
        e_4 = {
          error: e_4_1
        };
      } finally {
        try {
          if (_k && !_k.done && (_c = _j.return)) _c.call(_j);
        } finally {
          if (e_4) throw e_4.error;
        }
      }

      var isDone = isInFinalState(state.configuration || [], this.machine);

      if (this.state.configuration && isDone) {
        // get final child state node
        var finalChildStateNode = state.configuration.find(function (sn) {
          return sn.type === 'final' && sn.parent === _this.machine;
        });
        var doneData = finalChildStateNode && finalChildStateNode.data ? mapContext(finalChildStateNode.data, state.context, _event) : undefined;

        try {
          for (var _l = __values(this.doneListeners), _m = _l.next(); !_m.done; _m = _l.next()) {
            var listener = _m.value;
            listener(doneInvoke(this.id, doneData));
          }
        } catch (e_5_1) {
          e_5 = {
            error: e_5_1
          };
        } finally {
          try {
            if (_m && !_m.done && (_d = _l.return)) _d.call(_l);
          } finally {
            if (e_5) throw e_5.error;
          }
        }

        this.stop();
      }
    };
    /*
     * Adds a listener that is notified whenever a state transition happens. The listener is called with
     * the next state and the event object that caused the state transition.
     *
     * @param listener The state listener
     */


    Interpreter.prototype.onTransition = function (listener) {
      this.listeners.add(listener); // Send current state to listener

      if (this._status === InterpreterStatus.Running) {
        listener(this.state, this.state.event);
      }

      return this;
    };

    Interpreter.prototype.subscribe = function (nextListenerOrObserver, // @ts-ignore
    errorListener, completeListener) {
      var _this = this;

      if (!nextListenerOrObserver) {
        return {
          unsubscribe: function () {
            return void 0;
          }
        };
      }

      var listener;
      var resolvedCompleteListener = completeListener;

      if (typeof nextListenerOrObserver === 'function') {
        listener = nextListenerOrObserver;
      } else {
        listener = nextListenerOrObserver.next.bind(nextListenerOrObserver);
        resolvedCompleteListener = nextListenerOrObserver.complete.bind(nextListenerOrObserver);
      }

      this.listeners.add(listener); // Send current state to listener

      if (this._status === InterpreterStatus.Running) {
        listener(this.state);
      }

      if (resolvedCompleteListener) {
        this.onDone(resolvedCompleteListener);
      }

      return {
        unsubscribe: function () {
          listener && _this.listeners.delete(listener);
          resolvedCompleteListener && _this.doneListeners.delete(resolvedCompleteListener);
        }
      };
    };
    /**
     * Adds an event listener that is notified whenever an event is sent to the running interpreter.
     * @param listener The event listener
     */


    Interpreter.prototype.onEvent = function (listener) {
      this.eventListeners.add(listener);
      return this;
    };
    /**
     * Adds an event listener that is notified whenever a `send` event occurs.
     * @param listener The event listener
     */


    Interpreter.prototype.onSend = function (listener) {
      this.sendListeners.add(listener);
      return this;
    };
    /**
     * Adds a context listener that is notified whenever the state context changes.
     * @param listener The context listener
     */


    Interpreter.prototype.onChange = function (listener) {
      this.contextListeners.add(listener);
      return this;
    };
    /**
     * Adds a listener that is notified when the machine is stopped.
     * @param listener The listener
     */


    Interpreter.prototype.onStop = function (listener) {
      this.stopListeners.add(listener);
      return this;
    };
    /**
     * Adds a state listener that is notified when the statechart has reached its final state.
     * @param listener The state listener
     */


    Interpreter.prototype.onDone = function (listener) {
      this.doneListeners.add(listener);
      return this;
    };
    /**
     * Removes a listener.
     * @param listener The listener to remove
     */


    Interpreter.prototype.off = function (listener) {
      this.listeners.delete(listener);
      this.eventListeners.delete(listener);
      this.sendListeners.delete(listener);
      this.stopListeners.delete(listener);
      this.doneListeners.delete(listener);
      this.contextListeners.delete(listener);
      return this;
    };
    /**
     * Starts the interpreter from the given state, or the initial state.
     * @param initialState The state to start the statechart from
     */


    Interpreter.prototype.start = function (initialState) {
      var _this = this;

      if (this._status === InterpreterStatus.Running) {
        // Do not restart the service if it is already started
        return this;
      }

      this.initialized = true;
      this._status = InterpreterStatus.Running;
      var resolvedState = initialState === undefined ? this.initialState : withServiceScope(this, function () {
        return isState(initialState) ? _this.machine.resolveState(initialState) : _this.machine.resolveState(State.from(initialState, _this.machine.context));
      });

      if (this.options.devTools) {
        this.attachDev();
      }

      this.scheduler.initialize(function () {
        _this.update(resolvedState, initEvent);
      });
      return this;
    };
    /**
     * Stops the interpreter and unsubscribe all listeners.
     *
     * This will also notify the `onStop` listeners.
     */


    Interpreter.prototype.stop = function () {
      var e_6, _a, e_7, _b, e_8, _c, e_9, _d, e_10, _e;

      try {
        for (var _f = __values(this.listeners), _g = _f.next(); !_g.done; _g = _f.next()) {
          var listener = _g.value;
          this.listeners.delete(listener);
        }
      } catch (e_6_1) {
        e_6 = {
          error: e_6_1
        };
      } finally {
        try {
          if (_g && !_g.done && (_a = _f.return)) _a.call(_f);
        } finally {
          if (e_6) throw e_6.error;
        }
      }

      try {
        for (var _h = __values(this.stopListeners), _j = _h.next(); !_j.done; _j = _h.next()) {
          var listener = _j.value; // call listener, then remove

          listener();
          this.stopListeners.delete(listener);
        }
      } catch (e_7_1) {
        e_7 = {
          error: e_7_1
        };
      } finally {
        try {
          if (_j && !_j.done && (_b = _h.return)) _b.call(_h);
        } finally {
          if (e_7) throw e_7.error;
        }
      }

      try {
        for (var _k = __values(this.contextListeners), _l = _k.next(); !_l.done; _l = _k.next()) {
          var listener = _l.value;
          this.contextListeners.delete(listener);
        }
      } catch (e_8_1) {
        e_8 = {
          error: e_8_1
        };
      } finally {
        try {
          if (_l && !_l.done && (_c = _k.return)) _c.call(_k);
        } finally {
          if (e_8) throw e_8.error;
        }
      }

      try {
        for (var _m = __values(this.doneListeners), _o = _m.next(); !_o.done; _o = _m.next()) {
          var listener = _o.value;
          this.doneListeners.delete(listener);
        }
      } catch (e_9_1) {
        e_9 = {
          error: e_9_1
        };
      } finally {
        try {
          if (_o && !_o.done && (_d = _m.return)) _d.call(_m);
        } finally {
          if (e_9) throw e_9.error;
        }
      } // Stop all children


      this.children.forEach(function (child) {
        if (isFunction(child.stop)) {
          child.stop();
        }
      });

      try {
        // Cancel all delayed events
        for (var _p = __values(keys(this.delayedEventsMap)), _q = _p.next(); !_q.done; _q = _p.next()) {
          var key = _q.value;
          this.clock.clearTimeout(this.delayedEventsMap[key]);
        }
      } catch (e_10_1) {
        e_10 = {
          error: e_10_1
        };
      } finally {
        try {
          if (_q && !_q.done && (_e = _p.return)) _e.call(_p);
        } finally {
          if (e_10) throw e_10.error;
        }
      }

      this.scheduler.clear();
      this.initialized = false;
      this._status = InterpreterStatus.Stopped;
      return this;
    };

    Interpreter.prototype.batch = function (events) {
      var _this = this;

      if (this._status === InterpreterStatus.NotStarted && this.options.deferEvents) {
        // tslint:disable-next-line:no-console
        if (!IS_PRODUCTION) {
          warn(false, events.length + " event(s) were sent to uninitialized service \"" + this.machine.id + "\" and are deferred. Make sure .start() is called for this service.\nEvent: " + JSON.stringify(event));
        }
      } else if (this._status !== InterpreterStatus.Running) {
        throw new Error( // tslint:disable-next-line:max-line-length
        events.length + " event(s) were sent to uninitialized service \"" + this.machine.id + "\". Make sure .start() is called for this service, or set { deferEvents: true } in the service options.");
      }

      this.scheduler.schedule(function () {
        var e_11, _a;

        var nextState = _this.state;
        var batchChanged = false;
        var batchedActions = [];

        var _loop_1 = function (event_1) {
          var _event = toSCXMLEvent(event_1);

          _this.forward(_event);

          nextState = withServiceScope(_this, function () {
            return _this.machine.transition(nextState, _event);
          });
          batchedActions.push.apply(batchedActions, __spread(nextState.actions.map(function (a) {
            return bindActionToState(a, nextState);
          })));
          batchChanged = batchChanged || !!nextState.changed;
        };

        try {
          for (var events_1 = __values(events), events_1_1 = events_1.next(); !events_1_1.done; events_1_1 = events_1.next()) {
            var event_1 = events_1_1.value;

            _loop_1(event_1);
          }
        } catch (e_11_1) {
          e_11 = {
            error: e_11_1
          };
        } finally {
          try {
            if (events_1_1 && !events_1_1.done && (_a = events_1.return)) _a.call(events_1);
          } finally {
            if (e_11) throw e_11.error;
          }
        }

        nextState.changed = batchChanged;
        nextState.actions = batchedActions;

        _this.update(nextState, toSCXMLEvent(events[events.length - 1]));
      });
    };
    /**
     * Returns a send function bound to this interpreter instance.
     *
     * @param event The event to be sent by the sender.
     */


    Interpreter.prototype.sender = function (event) {
      return this.send.bind(this, event);
    };
    /**
     * Returns the next state given the interpreter's current state and the event.
     *
     * This is a pure method that does _not_ update the interpreter's state.
     *
     * @param event The event to determine the next state
     */


    Interpreter.prototype.nextState = function (event) {
      var _this = this;

      var _event = toSCXMLEvent(event);

      if (_event.name.indexOf(errorPlatform) === 0 && !this.state.nextEvents.some(function (nextEvent) {
        return nextEvent.indexOf(errorPlatform) === 0;
      })) {
        throw _event.data.data;
      }

      var nextState = withServiceScope(this, function () {
        return _this.machine.transition(_this.state, _event);
      });
      return nextState;
    };

    Interpreter.prototype.forward = function (event) {
      var e_12, _a;

      try {
        for (var _b = __values(this.forwardTo), _c = _b.next(); !_c.done; _c = _b.next()) {
          var id = _c.value;
          var child = this.children.get(id);

          if (!child) {
            throw new Error("Unable to forward event '" + event + "' from interpreter '" + this.id + "' to nonexistant child '" + id + "'.");
          }

          child.send(event);
        }
      } catch (e_12_1) {
        e_12 = {
          error: e_12_1
        };
      } finally {
        try {
          if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        } finally {
          if (e_12) throw e_12.error;
        }
      }
    };

    Interpreter.prototype.defer = function (sendAction) {
      var _this = this;

      this.delayedEventsMap[sendAction.id] = this.clock.setTimeout(function () {
        if (sendAction.to) {
          _this.sendTo(sendAction._event, sendAction.to);
        } else {
          _this.send(sendAction._event);
        }
      }, sendAction.delay);
    };

    Interpreter.prototype.cancel = function (sendId) {
      this.clock.clearTimeout(this.delayedEventsMap[sendId]);
      delete this.delayedEventsMap[sendId];
    };

    Interpreter.prototype.exec = function (action, state, actionFunctionMap) {
      var context = state.context,
          _event = state._event;
      var actionOrExec = getActionFunction(action.type, actionFunctionMap) || action.exec;
      var exec = isFunction(actionOrExec) ? actionOrExec : actionOrExec ? actionOrExec.exec : action.exec;

      if (exec) {
        try {
          return exec(context, _event.data, {
            action: action,
            state: this.state,
            _event: _event
          });
        } catch (err) {
          if (this.parent) {
            this.parent.send({
              type: 'xstate.error',
              data: err
            });
          }

          throw err;
        }
      }

      switch (action.type) {
        case send:
          var sendAction = action;

          if (typeof sendAction.delay === 'number') {
            this.defer(sendAction);
            return;
          } else {
            if (sendAction.to) {
              this.sendTo(sendAction._event, sendAction.to);
            } else {
              this.send(sendAction._event);
            }
          }

          break;

        case cancel:
          this.cancel(action.sendId);
          break;

        case start:
          {
            var activity = action.activity; // If the activity will be stopped right after it's started
            // (such as in transient states)
            // don't bother starting the activity.

            if (!this.state.activities[activity.type]) {
              break;
            } // Invoked services


            if (activity.type === ActionTypes.Invoke) {
              var serviceCreator = this.machine.options.services ? this.machine.options.services[activity.src] : undefined;
              var id = activity.id,
                  data = activity.data;

              if (!IS_PRODUCTION) {
                warn(!('forward' in activity), // tslint:disable-next-line:max-line-length
                "`forward` property is deprecated (found in invocation of '" + activity.src + "' in in machine '" + this.machine.id + "'). " + "Please use `autoForward` instead.");
              }

              var autoForward = 'autoForward' in activity ? activity.autoForward : !!activity.forward;

              if (!serviceCreator) {
                // tslint:disable-next-line:no-console
                if (!IS_PRODUCTION) {
                  warn(false, "No service found for invocation '" + activity.src + "' in machine '" + this.machine.id + "'.");
                }

                return;
              }

              var source = isFunction(serviceCreator) ? serviceCreator(context, _event.data) : serviceCreator;

              if (isPromiseLike(source)) {
                this.state.children[id] = this.spawnPromise(Promise.resolve(source), id);
              } else if (isFunction(source)) {
                this.state.children[id] = this.spawnCallback(source, id);
              } else if (isObservable(source)) {
                this.state.children[id] = this.spawnObservable(source, id);
              } else if (isMachine(source)) {
                // TODO: try/catch here
                this.state.children[id] = this.spawnMachine(data ? source.withContext(mapContext(data, context, _event)) : source, {
                  id: id,
                  autoForward: autoForward
                });
              }
            } else {
              this.spawnActivity(activity);
            }

            break;
          }

        case stop:
          {
            this.stopChild(action.activity.id);
            break;
          }

        case log:
          var label = action.label,
              value = action.value;

          if (label) {
            this.logger(label, value);
          } else {
            this.logger(value);
          }

          break;

        default:
          if (!IS_PRODUCTION) {
            warn(false, "No implementation found for action type '" + action.type + "'");
          }

          break;
      }

      return undefined;
    };

    Interpreter.prototype.stopChild = function (childId) {
      var child = this.children.get(childId);

      if (!child) {
        return;
      }

      this.children.delete(childId);
      this.forwardTo.delete(childId);
      delete this.state.children[childId];

      if (isFunction(child.stop)) {
        child.stop();
      }
    };

    Interpreter.prototype.spawn = function (entity, name, options) {
      if (isPromiseLike(entity)) {
        return this.spawnPromise(Promise.resolve(entity), name);
      } else if (isFunction(entity)) {
        return this.spawnCallback(entity, name);
      } else if (isActor(entity)) {
        return this.spawnActor(entity);
      } else if (isObservable(entity)) {
        return this.spawnObservable(entity, name);
      } else if (isMachine(entity)) {
        return this.spawnMachine(entity, __assign(__assign({}, options), {
          id: name
        }));
      } else {
        throw new Error("Unable to spawn entity \"" + name + "\" of type \"" + typeof entity + "\".");
      }
    };

    Interpreter.prototype.spawnMachine = function (machine, options) {
      var _this = this;

      if (options === void 0) {
        options = {};
      }

      var childService = new Interpreter(machine, __assign(__assign({}, this.options), {
        parent: this,
        id: options.id || machine.id
      }));

      var resolvedOptions = __assign(__assign({}, DEFAULT_SPAWN_OPTIONS), options);

      if (resolvedOptions.sync) {
        childService.onTransition(function (state) {
          _this.send(update, {
            state: state,
            id: childService.id
          });
        });
      }

      childService.onDone(function (doneEvent) {
        _this.send(toSCXMLEvent(doneEvent, {
          origin: childService.id
        }));
      }).start();
      var actor = childService;
      this.children.set(childService.id, actor);

      if (resolvedOptions.autoForward) {
        this.forwardTo.add(childService.id);
      }

      return actor;
    };

    Interpreter.prototype.spawnPromise = function (promise, id) {
      var _this = this;

      var canceled = false;
      promise.then(function (response) {
        if (!canceled) {
          _this.send(toSCXMLEvent(doneInvoke(id, response), {
            origin: id
          }));
        }
      }, function (errorData) {
        if (!canceled) {
          var errorEvent = error$1(id, errorData);

          try {
            // Send "error.platform.id" to this (parent).
            _this.send(toSCXMLEvent(errorEvent, {
              origin: id
            }));
          } catch (error) {
            reportUnhandledExceptionOnInvocation(errorData, error, id);

            if (_this.devTools) {
              _this.devTools.send(errorEvent, _this.state);
            }

            if (_this.machine.strict) {
              // it would be better to always stop the state machine if unhandled
              // exception/promise rejection happens but because we don't want to
              // break existing code so enforce it on strict mode only especially so
              // because documentation says that onError is optional
              _this.stop();
            }
          }
        }
      });
      var actor = {
        id: id,
        send: function () {
          return void 0;
        },
        subscribe: function (next, handleError, complete) {
          var unsubscribed = false;
          promise.then(function (response) {
            if (unsubscribed) {
              return;
            }

            next && next(response);

            if (unsubscribed) {
              return;
            }

            complete && complete();
          }, function (err) {
            if (unsubscribed) {
              return;
            }

            handleError(err);
          });
          return {
            unsubscribe: function () {
              return unsubscribed = true;
            }
          };
        },
        stop: function () {
          canceled = true;
        },
        toJSON: function () {
          return {
            id: id
          };
        }
      };
      this.children.set(id, actor);
      return actor;
    };

    Interpreter.prototype.spawnCallback = function (callback, id) {
      var _this = this;

      var canceled = false;
      var receivers = new Set();
      var listeners = new Set();

      var receive = function (e) {
        listeners.forEach(function (listener) {
          return listener(e);
        });

        if (canceled) {
          return;
        }

        _this.send(e);
      };

      var callbackStop;

      try {
        callbackStop = callback(receive, function (newListener) {
          receivers.add(newListener);
        });
      } catch (err) {
        this.send(error$1(id, err));
      }

      if (isPromiseLike(callbackStop)) {
        // it turned out to be an async function, can't reliably check this before calling `callback`
        // because transpiled async functions are not recognizable
        return this.spawnPromise(callbackStop, id);
      }

      var actor = {
        id: id,
        send: function (event) {
          return receivers.forEach(function (receiver) {
            return receiver(event);
          });
        },
        subscribe: function (next) {
          listeners.add(next);
          return {
            unsubscribe: function () {
              listeners.delete(next);
            }
          };
        },
        stop: function () {
          canceled = true;

          if (isFunction(callbackStop)) {
            callbackStop();
          }
        },
        toJSON: function () {
          return {
            id: id
          };
        }
      };
      this.children.set(id, actor);
      return actor;
    };

    Interpreter.prototype.spawnObservable = function (source, id) {
      var _this = this;

      var subscription = source.subscribe(function (value) {
        _this.send(toSCXMLEvent(value, {
          origin: id
        }));
      }, function (err) {
        _this.send(toSCXMLEvent(error$1(id, err), {
          origin: id
        }));
      }, function () {
        _this.send(toSCXMLEvent(doneInvoke(id), {
          origin: id
        }));
      });
      var actor = {
        id: id,
        send: function () {
          return void 0;
        },
        subscribe: function (next, handleError, complete) {
          return source.subscribe(next, handleError, complete);
        },
        stop: function () {
          return subscription.unsubscribe();
        },
        toJSON: function () {
          return {
            id: id
          };
        }
      };
      this.children.set(id, actor);
      return actor;
    };

    Interpreter.prototype.spawnActor = function (actor) {
      this.children.set(actor.id, actor);
      return actor;
    };

    Interpreter.prototype.spawnActivity = function (activity) {
      var implementation = this.machine.options && this.machine.options.activities ? this.machine.options.activities[activity.type] : undefined;

      if (!implementation) {
        if (!IS_PRODUCTION) {
          warn(false, "No implementation found for activity '" + activity.type + "'");
        } // tslint:disable-next-line:no-console


        return;
      } // Start implementation


      var dispose = implementation(this.state.context, activity);
      this.spawnEffect(activity.id, dispose);
    };

    Interpreter.prototype.spawnEffect = function (id, dispose) {
      this.children.set(id, {
        id: id,
        send: function () {
          return void 0;
        },
        subscribe: function () {
          return {
            unsubscribe: function () {
              return void 0;
            }
          };
        },
        stop: dispose || undefined,
        toJSON: function () {
          return {
            id: id
          };
        }
      });
    };

    Interpreter.prototype.attachDev = function () {
      if (this.options.devTools && typeof window !== 'undefined') {
        if (window.__REDUX_DEVTOOLS_EXTENSION__) {
          var devToolsOptions = typeof this.options.devTools === 'object' ? this.options.devTools : undefined;
          this.devTools = window.__REDUX_DEVTOOLS_EXTENSION__.connect(__assign(__assign({
            name: this.id,
            autoPause: true,
            stateSanitizer: function (state) {
              return {
                value: state.value,
                context: state.context,
                actions: state.actions
              };
            }
          }, devToolsOptions), {
            features: __assign({
              jump: false,
              skip: false
            }, devToolsOptions ? devToolsOptions.features : undefined)
          }), this.machine);
          this.devTools.init(this.state);
        } // add XState-specific dev tooling hook


        registerService(this);
      }
    };

    Interpreter.prototype.toJSON = function () {
      return {
        id: this.id
      };
    };

    Interpreter.prototype[symbolObservable] = function () {
      return this;
    };
    /**
     * The default interpreter options:
     *
     * - `clock` uses the global `setTimeout` and `clearTimeout` functions
     * - `logger` uses the global `console.log()` method
     */


    Interpreter.defaultOptions =
    /*#__PURE__*/
    function (global) {
      return {
        execute: true,
        deferEvents: true,
        clock: {
          setTimeout: function (fn, ms) {
            return global.setTimeout.call(null, fn, ms);
          },
          clearTimeout: function (id) {
            return global.clearTimeout.call(null, id);
          }
        },
        logger: global.console.log.bind(console),
        devTools: false
      };
    }(typeof window === 'undefined' ? global : window);

    Interpreter.interpret = interpret;
    return Interpreter;
  }();
  /**
   * Creates a new Interpreter instance for the given machine with the provided options, if any.
   *
   * @param machine The machine to interpret
   * @param options Interpreter options
   */


  function interpret(machine, options) {
    var interpreter = new Interpreter(machine, options);
    return interpreter;
  }

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function unwrapExports (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
  }

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var hammer = createCommonjsModule(function (module) {
  /*! Hammer.JS - v2.0.7 - 2016-04-22
   * http://hammerjs.github.io/
   *
   * Copyright (c) 2016 Jorik Tangelder;
   * Licensed under the MIT license */
  (function(window, document, exportName, undefined$1) {

  var VENDOR_PREFIXES = ['', 'webkit', 'Moz', 'MS', 'ms', 'o'];
  var TEST_ELEMENT = document.createElement('div');

  var TYPE_FUNCTION = 'function';

  var round = Math.round;
  var abs = Math.abs;
  var now = Date.now;

  /**
   * set a timeout with a given scope
   * @param {Function} fn
   * @param {Number} timeout
   * @param {Object} context
   * @returns {number}
   */
  function setTimeoutContext(fn, timeout, context) {
      return setTimeout(bindFn(fn, context), timeout);
  }

  /**
   * if the argument is an array, we want to execute the fn on each entry
   * if it aint an array we don't want to do a thing.
   * this is used by all the methods that accept a single and array argument.
   * @param {*|Array} arg
   * @param {String} fn
   * @param {Object} [context]
   * @returns {Boolean}
   */
  function invokeArrayArg(arg, fn, context) {
      if (Array.isArray(arg)) {
          each(arg, context[fn], context);
          return true;
      }
      return false;
  }

  /**
   * walk objects and arrays
   * @param {Object} obj
   * @param {Function} iterator
   * @param {Object} context
   */
  function each(obj, iterator, context) {
      var i;

      if (!obj) {
          return;
      }

      if (obj.forEach) {
          obj.forEach(iterator, context);
      } else if (obj.length !== undefined$1) {
          i = 0;
          while (i < obj.length) {
              iterator.call(context, obj[i], i, obj);
              i++;
          }
      } else {
          for (i in obj) {
              obj.hasOwnProperty(i) && iterator.call(context, obj[i], i, obj);
          }
      }
  }

  /**
   * wrap a method with a deprecation warning and stack trace
   * @param {Function} method
   * @param {String} name
   * @param {String} message
   * @returns {Function} A new function wrapping the supplied method.
   */
  function deprecate(method, name, message) {
      var deprecationMessage = 'DEPRECATED METHOD: ' + name + '\n' + message + ' AT \n';
      return function() {
          var e = new Error('get-stack-trace');
          var stack = e && e.stack ? e.stack.replace(/^[^\(]+?[\n$]/gm, '')
              .replace(/^\s+at\s+/gm, '')
              .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@') : 'Unknown Stack Trace';

          var log = window.console && (window.console.warn || window.console.log);
          if (log) {
              log.call(window.console, deprecationMessage, stack);
          }
          return method.apply(this, arguments);
      };
  }

  /**
   * extend object.
   * means that properties in dest will be overwritten by the ones in src.
   * @param {Object} target
   * @param {...Object} objects_to_assign
   * @returns {Object} target
   */
  var assign;
  if (typeof Object.assign !== 'function') {
      assign = function assign(target) {
          if (target === undefined$1 || target === null) {
              throw new TypeError('Cannot convert undefined or null to object');
          }

          var output = Object(target);
          for (var index = 1; index < arguments.length; index++) {
              var source = arguments[index];
              if (source !== undefined$1 && source !== null) {
                  for (var nextKey in source) {
                      if (source.hasOwnProperty(nextKey)) {
                          output[nextKey] = source[nextKey];
                      }
                  }
              }
          }
          return output;
      };
  } else {
      assign = Object.assign;
  }

  /**
   * extend object.
   * means that properties in dest will be overwritten by the ones in src.
   * @param {Object} dest
   * @param {Object} src
   * @param {Boolean} [merge=false]
   * @returns {Object} dest
   */
  var extend = deprecate(function extend(dest, src, merge) {
      var keys = Object.keys(src);
      var i = 0;
      while (i < keys.length) {
          if (!merge || (merge && dest[keys[i]] === undefined$1)) {
              dest[keys[i]] = src[keys[i]];
          }
          i++;
      }
      return dest;
  }, 'extend', 'Use `assign`.');

  /**
   * merge the values from src in the dest.
   * means that properties that exist in dest will not be overwritten by src
   * @param {Object} dest
   * @param {Object} src
   * @returns {Object} dest
   */
  var merge = deprecate(function merge(dest, src) {
      return extend(dest, src, true);
  }, 'merge', 'Use `assign`.');

  /**
   * simple class inheritance
   * @param {Function} child
   * @param {Function} base
   * @param {Object} [properties]
   */
  function inherit(child, base, properties) {
      var baseP = base.prototype,
          childP;

      childP = child.prototype = Object.create(baseP);
      childP.constructor = child;
      childP._super = baseP;

      if (properties) {
          assign(childP, properties);
      }
  }

  /**
   * simple function bind
   * @param {Function} fn
   * @param {Object} context
   * @returns {Function}
   */
  function bindFn(fn, context) {
      return function boundFn() {
          return fn.apply(context, arguments);
      };
  }

  /**
   * let a boolean value also be a function that must return a boolean
   * this first item in args will be used as the context
   * @param {Boolean|Function} val
   * @param {Array} [args]
   * @returns {Boolean}
   */
  function boolOrFn(val, args) {
      if (typeof val == TYPE_FUNCTION) {
          return val.apply(args ? args[0] || undefined$1 : undefined$1, args);
      }
      return val;
  }

  /**
   * use the val2 when val1 is undefined
   * @param {*} val1
   * @param {*} val2
   * @returns {*}
   */
  function ifUndefined(val1, val2) {
      return (val1 === undefined$1) ? val2 : val1;
  }

  /**
   * addEventListener with multiple events at once
   * @param {EventTarget} target
   * @param {String} types
   * @param {Function} handler
   */
  function addEventListeners(target, types, handler) {
      each(splitStr(types), function(type) {
          target.addEventListener(type, handler, false);
      });
  }

  /**
   * removeEventListener with multiple events at once
   * @param {EventTarget} target
   * @param {String} types
   * @param {Function} handler
   */
  function removeEventListeners(target, types, handler) {
      each(splitStr(types), function(type) {
          target.removeEventListener(type, handler, false);
      });
  }

  /**
   * find if a node is in the given parent
   * @method hasParent
   * @param {HTMLElement} node
   * @param {HTMLElement} parent
   * @return {Boolean} found
   */
  function hasParent(node, parent) {
      while (node) {
          if (node == parent) {
              return true;
          }
          node = node.parentNode;
      }
      return false;
  }

  /**
   * small indexOf wrapper
   * @param {String} str
   * @param {String} find
   * @returns {Boolean} found
   */
  function inStr(str, find) {
      return str.indexOf(find) > -1;
  }

  /**
   * split string on whitespace
   * @param {String} str
   * @returns {Array} words
   */
  function splitStr(str) {
      return str.trim().split(/\s+/g);
  }

  /**
   * find if a array contains the object using indexOf or a simple polyFill
   * @param {Array} src
   * @param {String} find
   * @param {String} [findByKey]
   * @return {Boolean|Number} false when not found, or the index
   */
  function inArray(src, find, findByKey) {
      if (src.indexOf && !findByKey) {
          return src.indexOf(find);
      } else {
          var i = 0;
          while (i < src.length) {
              if ((findByKey && src[i][findByKey] == find) || (!findByKey && src[i] === find)) {
                  return i;
              }
              i++;
          }
          return -1;
      }
  }

  /**
   * convert array-like objects to real arrays
   * @param {Object} obj
   * @returns {Array}
   */
  function toArray(obj) {
      return Array.prototype.slice.call(obj, 0);
  }

  /**
   * unique array with objects based on a key (like 'id') or just by the array's value
   * @param {Array} src [{id:1},{id:2},{id:1}]
   * @param {String} [key]
   * @param {Boolean} [sort=False]
   * @returns {Array} [{id:1},{id:2}]
   */
  function uniqueArray(src, key, sort) {
      var results = [];
      var values = [];
      var i = 0;

      while (i < src.length) {
          var val = key ? src[i][key] : src[i];
          if (inArray(values, val) < 0) {
              results.push(src[i]);
          }
          values[i] = val;
          i++;
      }

      if (sort) {
          if (!key) {
              results = results.sort();
          } else {
              results = results.sort(function sortUniqueArray(a, b) {
                  return a[key] > b[key];
              });
          }
      }

      return results;
  }

  /**
   * get the prefixed property
   * @param {Object} obj
   * @param {String} property
   * @returns {String|Undefined} prefixed
   */
  function prefixed(obj, property) {
      var prefix, prop;
      var camelProp = property[0].toUpperCase() + property.slice(1);

      var i = 0;
      while (i < VENDOR_PREFIXES.length) {
          prefix = VENDOR_PREFIXES[i];
          prop = (prefix) ? prefix + camelProp : property;

          if (prop in obj) {
              return prop;
          }
          i++;
      }
      return undefined$1;
  }

  /**
   * get a unique id
   * @returns {number} uniqueId
   */
  var _uniqueId = 1;
  function uniqueId() {
      return _uniqueId++;
  }

  /**
   * get the window object of an element
   * @param {HTMLElement} element
   * @returns {DocumentView|Window}
   */
  function getWindowForElement(element) {
      var doc = element.ownerDocument || element;
      return (doc.defaultView || doc.parentWindow || window);
  }

  var MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android/i;

  var SUPPORT_TOUCH = ('ontouchstart' in window);
  var SUPPORT_POINTER_EVENTS = prefixed(window, 'PointerEvent') !== undefined$1;
  var SUPPORT_ONLY_TOUCH = SUPPORT_TOUCH && MOBILE_REGEX.test(navigator.userAgent);

  var INPUT_TYPE_TOUCH = 'touch';
  var INPUT_TYPE_PEN = 'pen';
  var INPUT_TYPE_MOUSE = 'mouse';
  var INPUT_TYPE_KINECT = 'kinect';

  var COMPUTE_INTERVAL = 25;

  var INPUT_START = 1;
  var INPUT_MOVE = 2;
  var INPUT_END = 4;
  var INPUT_CANCEL = 8;

  var DIRECTION_NONE = 1;
  var DIRECTION_LEFT = 2;
  var DIRECTION_RIGHT = 4;
  var DIRECTION_UP = 8;
  var DIRECTION_DOWN = 16;

  var DIRECTION_HORIZONTAL = DIRECTION_LEFT | DIRECTION_RIGHT;
  var DIRECTION_VERTICAL = DIRECTION_UP | DIRECTION_DOWN;
  var DIRECTION_ALL = DIRECTION_HORIZONTAL | DIRECTION_VERTICAL;

  var PROPS_XY = ['x', 'y'];
  var PROPS_CLIENT_XY = ['clientX', 'clientY'];

  /**
   * create new input type manager
   * @param {Manager} manager
   * @param {Function} callback
   * @returns {Input}
   * @constructor
   */
  function Input(manager, callback) {
      var self = this;
      this.manager = manager;
      this.callback = callback;
      this.element = manager.element;
      this.target = manager.options.inputTarget;

      // smaller wrapper around the handler, for the scope and the enabled state of the manager,
      // so when disabled the input events are completely bypassed.
      this.domHandler = function(ev) {
          if (boolOrFn(manager.options.enable, [manager])) {
              self.handler(ev);
          }
      };

      this.init();

  }

  Input.prototype = {
      /**
       * should handle the inputEvent data and trigger the callback
       * @virtual
       */
      handler: function() { },

      /**
       * bind the events
       */
      init: function() {
          this.evEl && addEventListeners(this.element, this.evEl, this.domHandler);
          this.evTarget && addEventListeners(this.target, this.evTarget, this.domHandler);
          this.evWin && addEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
      },

      /**
       * unbind the events
       */
      destroy: function() {
          this.evEl && removeEventListeners(this.element, this.evEl, this.domHandler);
          this.evTarget && removeEventListeners(this.target, this.evTarget, this.domHandler);
          this.evWin && removeEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
      }
  };

  /**
   * create new input type manager
   * called by the Manager constructor
   * @param {Hammer} manager
   * @returns {Input}
   */
  function createInputInstance(manager) {
      var Type;
      var inputClass = manager.options.inputClass;

      if (inputClass) {
          Type = inputClass;
      } else if (SUPPORT_POINTER_EVENTS) {
          Type = PointerEventInput;
      } else if (SUPPORT_ONLY_TOUCH) {
          Type = TouchInput;
      } else if (!SUPPORT_TOUCH) {
          Type = MouseInput;
      } else {
          Type = TouchMouseInput;
      }
      return new (Type)(manager, inputHandler);
  }

  /**
   * handle input events
   * @param {Manager} manager
   * @param {String} eventType
   * @param {Object} input
   */
  function inputHandler(manager, eventType, input) {
      var pointersLen = input.pointers.length;
      var changedPointersLen = input.changedPointers.length;
      var isFirst = (eventType & INPUT_START && (pointersLen - changedPointersLen === 0));
      var isFinal = (eventType & (INPUT_END | INPUT_CANCEL) && (pointersLen - changedPointersLen === 0));

      input.isFirst = !!isFirst;
      input.isFinal = !!isFinal;

      if (isFirst) {
          manager.session = {};
      }

      // source event is the normalized value of the domEvents
      // like 'touchstart, mouseup, pointerdown'
      input.eventType = eventType;

      // compute scale, rotation etc
      computeInputData(manager, input);

      // emit secret event
      manager.emit('hammer.input', input);

      manager.recognize(input);
      manager.session.prevInput = input;
  }

  /**
   * extend the data with some usable properties like scale, rotate, velocity etc
   * @param {Object} manager
   * @param {Object} input
   */
  function computeInputData(manager, input) {
      var session = manager.session;
      var pointers = input.pointers;
      var pointersLength = pointers.length;

      // store the first input to calculate the distance and direction
      if (!session.firstInput) {
          session.firstInput = simpleCloneInputData(input);
      }

      // to compute scale and rotation we need to store the multiple touches
      if (pointersLength > 1 && !session.firstMultiple) {
          session.firstMultiple = simpleCloneInputData(input);
      } else if (pointersLength === 1) {
          session.firstMultiple = false;
      }

      var firstInput = session.firstInput;
      var firstMultiple = session.firstMultiple;
      var offsetCenter = firstMultiple ? firstMultiple.center : firstInput.center;

      var center = input.center = getCenter(pointers);
      input.timeStamp = now();
      input.deltaTime = input.timeStamp - firstInput.timeStamp;

      input.angle = getAngle(offsetCenter, center);
      input.distance = getDistance(offsetCenter, center);

      computeDeltaXY(session, input);
      input.offsetDirection = getDirection(input.deltaX, input.deltaY);

      var overallVelocity = getVelocity(input.deltaTime, input.deltaX, input.deltaY);
      input.overallVelocityX = overallVelocity.x;
      input.overallVelocityY = overallVelocity.y;
      input.overallVelocity = (abs(overallVelocity.x) > abs(overallVelocity.y)) ? overallVelocity.x : overallVelocity.y;

      input.scale = firstMultiple ? getScale(firstMultiple.pointers, pointers) : 1;
      input.rotation = firstMultiple ? getRotation(firstMultiple.pointers, pointers) : 0;

      input.maxPointers = !session.prevInput ? input.pointers.length : ((input.pointers.length >
          session.prevInput.maxPointers) ? input.pointers.length : session.prevInput.maxPointers);

      computeIntervalInputData(session, input);

      // find the correct target
      var target = manager.element;
      if (hasParent(input.srcEvent.target, target)) {
          target = input.srcEvent.target;
      }
      input.target = target;
  }

  function computeDeltaXY(session, input) {
      var center = input.center;
      var offset = session.offsetDelta || {};
      var prevDelta = session.prevDelta || {};
      var prevInput = session.prevInput || {};

      if (input.eventType === INPUT_START || prevInput.eventType === INPUT_END) {
          prevDelta = session.prevDelta = {
              x: prevInput.deltaX || 0,
              y: prevInput.deltaY || 0
          };

          offset = session.offsetDelta = {
              x: center.x,
              y: center.y
          };
      }

      input.deltaX = prevDelta.x + (center.x - offset.x);
      input.deltaY = prevDelta.y + (center.y - offset.y);
  }

  /**
   * velocity is calculated every x ms
   * @param {Object} session
   * @param {Object} input
   */
  function computeIntervalInputData(session, input) {
      var last = session.lastInterval || input,
          deltaTime = input.timeStamp - last.timeStamp,
          velocity, velocityX, velocityY, direction;

      if (input.eventType != INPUT_CANCEL && (deltaTime > COMPUTE_INTERVAL || last.velocity === undefined$1)) {
          var deltaX = input.deltaX - last.deltaX;
          var deltaY = input.deltaY - last.deltaY;

          var v = getVelocity(deltaTime, deltaX, deltaY);
          velocityX = v.x;
          velocityY = v.y;
          velocity = (abs(v.x) > abs(v.y)) ? v.x : v.y;
          direction = getDirection(deltaX, deltaY);

          session.lastInterval = input;
      } else {
          // use latest velocity info if it doesn't overtake a minimum period
          velocity = last.velocity;
          velocityX = last.velocityX;
          velocityY = last.velocityY;
          direction = last.direction;
      }

      input.velocity = velocity;
      input.velocityX = velocityX;
      input.velocityY = velocityY;
      input.direction = direction;
  }

  /**
   * create a simple clone from the input used for storage of firstInput and firstMultiple
   * @param {Object} input
   * @returns {Object} clonedInputData
   */
  function simpleCloneInputData(input) {
      // make a simple copy of the pointers because we will get a reference if we don't
      // we only need clientXY for the calculations
      var pointers = [];
      var i = 0;
      while (i < input.pointers.length) {
          pointers[i] = {
              clientX: round(input.pointers[i].clientX),
              clientY: round(input.pointers[i].clientY)
          };
          i++;
      }

      return {
          timeStamp: now(),
          pointers: pointers,
          center: getCenter(pointers),
          deltaX: input.deltaX,
          deltaY: input.deltaY
      };
  }

  /**
   * get the center of all the pointers
   * @param {Array} pointers
   * @return {Object} center contains `x` and `y` properties
   */
  function getCenter(pointers) {
      var pointersLength = pointers.length;

      // no need to loop when only one touch
      if (pointersLength === 1) {
          return {
              x: round(pointers[0].clientX),
              y: round(pointers[0].clientY)
          };
      }

      var x = 0, y = 0, i = 0;
      while (i < pointersLength) {
          x += pointers[i].clientX;
          y += pointers[i].clientY;
          i++;
      }

      return {
          x: round(x / pointersLength),
          y: round(y / pointersLength)
      };
  }

  /**
   * calculate the velocity between two points. unit is in px per ms.
   * @param {Number} deltaTime
   * @param {Number} x
   * @param {Number} y
   * @return {Object} velocity `x` and `y`
   */
  function getVelocity(deltaTime, x, y) {
      return {
          x: x / deltaTime || 0,
          y: y / deltaTime || 0
      };
  }

  /**
   * get the direction between two points
   * @param {Number} x
   * @param {Number} y
   * @return {Number} direction
   */
  function getDirection(x, y) {
      if (x === y) {
          return DIRECTION_NONE;
      }

      if (abs(x) >= abs(y)) {
          return x < 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
      }
      return y < 0 ? DIRECTION_UP : DIRECTION_DOWN;
  }

  /**
   * calculate the absolute distance between two points
   * @param {Object} p1 {x, y}
   * @param {Object} p2 {x, y}
   * @param {Array} [props] containing x and y keys
   * @return {Number} distance
   */
  function getDistance(p1, p2, props) {
      if (!props) {
          props = PROPS_XY;
      }
      var x = p2[props[0]] - p1[props[0]],
          y = p2[props[1]] - p1[props[1]];

      return Math.sqrt((x * x) + (y * y));
  }

  /**
   * calculate the angle between two coordinates
   * @param {Object} p1
   * @param {Object} p2
   * @param {Array} [props] containing x and y keys
   * @return {Number} angle
   */
  function getAngle(p1, p2, props) {
      if (!props) {
          props = PROPS_XY;
      }
      var x = p2[props[0]] - p1[props[0]],
          y = p2[props[1]] - p1[props[1]];
      return Math.atan2(y, x) * 180 / Math.PI;
  }

  /**
   * calculate the rotation degrees between two pointersets
   * @param {Array} start array of pointers
   * @param {Array} end array of pointers
   * @return {Number} rotation
   */
  function getRotation(start, end) {
      return getAngle(end[1], end[0], PROPS_CLIENT_XY) + getAngle(start[1], start[0], PROPS_CLIENT_XY);
  }

  /**
   * calculate the scale factor between two pointersets
   * no scale is 1, and goes down to 0 when pinched together, and bigger when pinched out
   * @param {Array} start array of pointers
   * @param {Array} end array of pointers
   * @return {Number} scale
   */
  function getScale(start, end) {
      return getDistance(end[0], end[1], PROPS_CLIENT_XY) / getDistance(start[0], start[1], PROPS_CLIENT_XY);
  }

  var MOUSE_INPUT_MAP = {
      mousedown: INPUT_START,
      mousemove: INPUT_MOVE,
      mouseup: INPUT_END
  };

  var MOUSE_ELEMENT_EVENTS = 'mousedown';
  var MOUSE_WINDOW_EVENTS = 'mousemove mouseup';

  /**
   * Mouse events input
   * @constructor
   * @extends Input
   */
  function MouseInput() {
      this.evEl = MOUSE_ELEMENT_EVENTS;
      this.evWin = MOUSE_WINDOW_EVENTS;

      this.pressed = false; // mousedown state

      Input.apply(this, arguments);
  }

  inherit(MouseInput, Input, {
      /**
       * handle mouse events
       * @param {Object} ev
       */
      handler: function MEhandler(ev) {
          var eventType = MOUSE_INPUT_MAP[ev.type];

          // on start we want to have the left mouse button down
          if (eventType & INPUT_START && ev.button === 0) {
              this.pressed = true;
          }

          if (eventType & INPUT_MOVE && ev.which !== 1) {
              eventType = INPUT_END;
          }

          // mouse must be down
          if (!this.pressed) {
              return;
          }

          if (eventType & INPUT_END) {
              this.pressed = false;
          }

          this.callback(this.manager, eventType, {
              pointers: [ev],
              changedPointers: [ev],
              pointerType: INPUT_TYPE_MOUSE,
              srcEvent: ev
          });
      }
  });

  var POINTER_INPUT_MAP = {
      pointerdown: INPUT_START,
      pointermove: INPUT_MOVE,
      pointerup: INPUT_END,
      pointercancel: INPUT_CANCEL,
      pointerout: INPUT_CANCEL
  };

  // in IE10 the pointer types is defined as an enum
  var IE10_POINTER_TYPE_ENUM = {
      2: INPUT_TYPE_TOUCH,
      3: INPUT_TYPE_PEN,
      4: INPUT_TYPE_MOUSE,
      5: INPUT_TYPE_KINECT // see https://twitter.com/jacobrossi/status/480596438489890816
  };

  var POINTER_ELEMENT_EVENTS = 'pointerdown';
  var POINTER_WINDOW_EVENTS = 'pointermove pointerup pointercancel';

  // IE10 has prefixed support, and case-sensitive
  if (window.MSPointerEvent && !window.PointerEvent) {
      POINTER_ELEMENT_EVENTS = 'MSPointerDown';
      POINTER_WINDOW_EVENTS = 'MSPointerMove MSPointerUp MSPointerCancel';
  }

  /**
   * Pointer events input
   * @constructor
   * @extends Input
   */
  function PointerEventInput() {
      this.evEl = POINTER_ELEMENT_EVENTS;
      this.evWin = POINTER_WINDOW_EVENTS;

      Input.apply(this, arguments);

      this.store = (this.manager.session.pointerEvents = []);
  }

  inherit(PointerEventInput, Input, {
      /**
       * handle mouse events
       * @param {Object} ev
       */
      handler: function PEhandler(ev) {
          var store = this.store;
          var removePointer = false;

          var eventTypeNormalized = ev.type.toLowerCase().replace('ms', '');
          var eventType = POINTER_INPUT_MAP[eventTypeNormalized];
          var pointerType = IE10_POINTER_TYPE_ENUM[ev.pointerType] || ev.pointerType;

          var isTouch = (pointerType == INPUT_TYPE_TOUCH);

          // get index of the event in the store
          var storeIndex = inArray(store, ev.pointerId, 'pointerId');

          // start and mouse must be down
          if (eventType & INPUT_START && (ev.button === 0 || isTouch)) {
              if (storeIndex < 0) {
                  store.push(ev);
                  storeIndex = store.length - 1;
              }
          } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
              removePointer = true;
          }

          // it not found, so the pointer hasn't been down (so it's probably a hover)
          if (storeIndex < 0) {
              return;
          }

          // update the event in the store
          store[storeIndex] = ev;

          this.callback(this.manager, eventType, {
              pointers: store,
              changedPointers: [ev],
              pointerType: pointerType,
              srcEvent: ev
          });

          if (removePointer) {
              // remove from the store
              store.splice(storeIndex, 1);
          }
      }
  });

  var SINGLE_TOUCH_INPUT_MAP = {
      touchstart: INPUT_START,
      touchmove: INPUT_MOVE,
      touchend: INPUT_END,
      touchcancel: INPUT_CANCEL
  };

  var SINGLE_TOUCH_TARGET_EVENTS = 'touchstart';
  var SINGLE_TOUCH_WINDOW_EVENTS = 'touchstart touchmove touchend touchcancel';

  /**
   * Touch events input
   * @constructor
   * @extends Input
   */
  function SingleTouchInput() {
      this.evTarget = SINGLE_TOUCH_TARGET_EVENTS;
      this.evWin = SINGLE_TOUCH_WINDOW_EVENTS;
      this.started = false;

      Input.apply(this, arguments);
  }

  inherit(SingleTouchInput, Input, {
      handler: function TEhandler(ev) {
          var type = SINGLE_TOUCH_INPUT_MAP[ev.type];

          // should we handle the touch events?
          if (type === INPUT_START) {
              this.started = true;
          }

          if (!this.started) {
              return;
          }

          var touches = normalizeSingleTouches.call(this, ev, type);

          // when done, reset the started state
          if (type & (INPUT_END | INPUT_CANCEL) && touches[0].length - touches[1].length === 0) {
              this.started = false;
          }

          this.callback(this.manager, type, {
              pointers: touches[0],
              changedPointers: touches[1],
              pointerType: INPUT_TYPE_TOUCH,
              srcEvent: ev
          });
      }
  });

  /**
   * @this {TouchInput}
   * @param {Object} ev
   * @param {Number} type flag
   * @returns {undefined|Array} [all, changed]
   */
  function normalizeSingleTouches(ev, type) {
      var all = toArray(ev.touches);
      var changed = toArray(ev.changedTouches);

      if (type & (INPUT_END | INPUT_CANCEL)) {
          all = uniqueArray(all.concat(changed), 'identifier', true);
      }

      return [all, changed];
  }

  var TOUCH_INPUT_MAP = {
      touchstart: INPUT_START,
      touchmove: INPUT_MOVE,
      touchend: INPUT_END,
      touchcancel: INPUT_CANCEL
  };

  var TOUCH_TARGET_EVENTS = 'touchstart touchmove touchend touchcancel';

  /**
   * Multi-user touch events input
   * @constructor
   * @extends Input
   */
  function TouchInput() {
      this.evTarget = TOUCH_TARGET_EVENTS;
      this.targetIds = {};

      Input.apply(this, arguments);
  }

  inherit(TouchInput, Input, {
      handler: function MTEhandler(ev) {
          var type = TOUCH_INPUT_MAP[ev.type];
          var touches = getTouches.call(this, ev, type);
          if (!touches) {
              return;
          }

          this.callback(this.manager, type, {
              pointers: touches[0],
              changedPointers: touches[1],
              pointerType: INPUT_TYPE_TOUCH,
              srcEvent: ev
          });
      }
  });

  /**
   * @this {TouchInput}
   * @param {Object} ev
   * @param {Number} type flag
   * @returns {undefined|Array} [all, changed]
   */
  function getTouches(ev, type) {
      var allTouches = toArray(ev.touches);
      var targetIds = this.targetIds;

      // when there is only one touch, the process can be simplified
      if (type & (INPUT_START | INPUT_MOVE) && allTouches.length === 1) {
          targetIds[allTouches[0].identifier] = true;
          return [allTouches, allTouches];
      }

      var i,
          targetTouches,
          changedTouches = toArray(ev.changedTouches),
          changedTargetTouches = [],
          target = this.target;

      // get target touches from touches
      targetTouches = allTouches.filter(function(touch) {
          return hasParent(touch.target, target);
      });

      // collect touches
      if (type === INPUT_START) {
          i = 0;
          while (i < targetTouches.length) {
              targetIds[targetTouches[i].identifier] = true;
              i++;
          }
      }

      // filter changed touches to only contain touches that exist in the collected target ids
      i = 0;
      while (i < changedTouches.length) {
          if (targetIds[changedTouches[i].identifier]) {
              changedTargetTouches.push(changedTouches[i]);
          }

          // cleanup removed touches
          if (type & (INPUT_END | INPUT_CANCEL)) {
              delete targetIds[changedTouches[i].identifier];
          }
          i++;
      }

      if (!changedTargetTouches.length) {
          return;
      }

      return [
          // merge targetTouches with changedTargetTouches so it contains ALL touches, including 'end' and 'cancel'
          uniqueArray(targetTouches.concat(changedTargetTouches), 'identifier', true),
          changedTargetTouches
      ];
  }

  /**
   * Combined touch and mouse input
   *
   * Touch has a higher priority then mouse, and while touching no mouse events are allowed.
   * This because touch devices also emit mouse events while doing a touch.
   *
   * @constructor
   * @extends Input
   */

  var DEDUP_TIMEOUT = 2500;
  var DEDUP_DISTANCE = 25;

  function TouchMouseInput() {
      Input.apply(this, arguments);

      var handler = bindFn(this.handler, this);
      this.touch = new TouchInput(this.manager, handler);
      this.mouse = new MouseInput(this.manager, handler);

      this.primaryTouch = null;
      this.lastTouches = [];
  }

  inherit(TouchMouseInput, Input, {
      /**
       * handle mouse and touch events
       * @param {Hammer} manager
       * @param {String} inputEvent
       * @param {Object} inputData
       */
      handler: function TMEhandler(manager, inputEvent, inputData) {
          var isTouch = (inputData.pointerType == INPUT_TYPE_TOUCH),
              isMouse = (inputData.pointerType == INPUT_TYPE_MOUSE);

          if (isMouse && inputData.sourceCapabilities && inputData.sourceCapabilities.firesTouchEvents) {
              return;
          }

          // when we're in a touch event, record touches to  de-dupe synthetic mouse event
          if (isTouch) {
              recordTouches.call(this, inputEvent, inputData);
          } else if (isMouse && isSyntheticEvent.call(this, inputData)) {
              return;
          }

          this.callback(manager, inputEvent, inputData);
      },

      /**
       * remove the event listeners
       */
      destroy: function destroy() {
          this.touch.destroy();
          this.mouse.destroy();
      }
  });

  function recordTouches(eventType, eventData) {
      if (eventType & INPUT_START) {
          this.primaryTouch = eventData.changedPointers[0].identifier;
          setLastTouch.call(this, eventData);
      } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
          setLastTouch.call(this, eventData);
      }
  }

  function setLastTouch(eventData) {
      var touch = eventData.changedPointers[0];

      if (touch.identifier === this.primaryTouch) {
          var lastTouch = {x: touch.clientX, y: touch.clientY};
          this.lastTouches.push(lastTouch);
          var lts = this.lastTouches;
          var removeLastTouch = function() {
              var i = lts.indexOf(lastTouch);
              if (i > -1) {
                  lts.splice(i, 1);
              }
          };
          setTimeout(removeLastTouch, DEDUP_TIMEOUT);
      }
  }

  function isSyntheticEvent(eventData) {
      var x = eventData.srcEvent.clientX, y = eventData.srcEvent.clientY;
      for (var i = 0; i < this.lastTouches.length; i++) {
          var t = this.lastTouches[i];
          var dx = Math.abs(x - t.x), dy = Math.abs(y - t.y);
          if (dx <= DEDUP_DISTANCE && dy <= DEDUP_DISTANCE) {
              return true;
          }
      }
      return false;
  }

  var PREFIXED_TOUCH_ACTION = prefixed(TEST_ELEMENT.style, 'touchAction');
  var NATIVE_TOUCH_ACTION = PREFIXED_TOUCH_ACTION !== undefined$1;

  // magical touchAction value
  var TOUCH_ACTION_COMPUTE = 'compute';
  var TOUCH_ACTION_AUTO = 'auto';
  var TOUCH_ACTION_MANIPULATION = 'manipulation'; // not implemented
  var TOUCH_ACTION_NONE = 'none';
  var TOUCH_ACTION_PAN_X = 'pan-x';
  var TOUCH_ACTION_PAN_Y = 'pan-y';
  var TOUCH_ACTION_MAP = getTouchActionProps();

  /**
   * Touch Action
   * sets the touchAction property or uses the js alternative
   * @param {Manager} manager
   * @param {String} value
   * @constructor
   */
  function TouchAction(manager, value) {
      this.manager = manager;
      this.set(value);
  }

  TouchAction.prototype = {
      /**
       * set the touchAction value on the element or enable the polyfill
       * @param {String} value
       */
      set: function(value) {
          // find out the touch-action by the event handlers
          if (value == TOUCH_ACTION_COMPUTE) {
              value = this.compute();
          }

          if (NATIVE_TOUCH_ACTION && this.manager.element.style && TOUCH_ACTION_MAP[value]) {
              this.manager.element.style[PREFIXED_TOUCH_ACTION] = value;
          }
          this.actions = value.toLowerCase().trim();
      },

      /**
       * just re-set the touchAction value
       */
      update: function() {
          this.set(this.manager.options.touchAction);
      },

      /**
       * compute the value for the touchAction property based on the recognizer's settings
       * @returns {String} value
       */
      compute: function() {
          var actions = [];
          each(this.manager.recognizers, function(recognizer) {
              if (boolOrFn(recognizer.options.enable, [recognizer])) {
                  actions = actions.concat(recognizer.getTouchAction());
              }
          });
          return cleanTouchActions(actions.join(' '));
      },

      /**
       * this method is called on each input cycle and provides the preventing of the browser behavior
       * @param {Object} input
       */
      preventDefaults: function(input) {
          var srcEvent = input.srcEvent;
          var direction = input.offsetDirection;

          // if the touch action did prevented once this session
          if (this.manager.session.prevented) {
              srcEvent.preventDefault();
              return;
          }

          var actions = this.actions;
          var hasNone = inStr(actions, TOUCH_ACTION_NONE) && !TOUCH_ACTION_MAP[TOUCH_ACTION_NONE];
          var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y) && !TOUCH_ACTION_MAP[TOUCH_ACTION_PAN_Y];
          var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X) && !TOUCH_ACTION_MAP[TOUCH_ACTION_PAN_X];

          if (hasNone) {
              //do not prevent defaults if this is a tap gesture

              var isTapPointer = input.pointers.length === 1;
              var isTapMovement = input.distance < 2;
              var isTapTouchTime = input.deltaTime < 250;

              if (isTapPointer && isTapMovement && isTapTouchTime) {
                  return;
              }
          }

          if (hasPanX && hasPanY) {
              // `pan-x pan-y` means browser handles all scrolling/panning, do not prevent
              return;
          }

          if (hasNone ||
              (hasPanY && direction & DIRECTION_HORIZONTAL) ||
              (hasPanX && direction & DIRECTION_VERTICAL)) {
              return this.preventSrc(srcEvent);
          }
      },

      /**
       * call preventDefault to prevent the browser's default behavior (scrolling in most cases)
       * @param {Object} srcEvent
       */
      preventSrc: function(srcEvent) {
          this.manager.session.prevented = true;
          srcEvent.preventDefault();
      }
  };

  /**
   * when the touchActions are collected they are not a valid value, so we need to clean things up. *
   * @param {String} actions
   * @returns {*}
   */
  function cleanTouchActions(actions) {
      // none
      if (inStr(actions, TOUCH_ACTION_NONE)) {
          return TOUCH_ACTION_NONE;
      }

      var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X);
      var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y);

      // if both pan-x and pan-y are set (different recognizers
      // for different directions, e.g. horizontal pan but vertical swipe?)
      // we need none (as otherwise with pan-x pan-y combined none of these
      // recognizers will work, since the browser would handle all panning
      if (hasPanX && hasPanY) {
          return TOUCH_ACTION_NONE;
      }

      // pan-x OR pan-y
      if (hasPanX || hasPanY) {
          return hasPanX ? TOUCH_ACTION_PAN_X : TOUCH_ACTION_PAN_Y;
      }

      // manipulation
      if (inStr(actions, TOUCH_ACTION_MANIPULATION)) {
          return TOUCH_ACTION_MANIPULATION;
      }

      return TOUCH_ACTION_AUTO;
  }

  function getTouchActionProps() {
      if (!NATIVE_TOUCH_ACTION) {
          return false;
      }
      var touchMap = {};
      var cssSupports = window.CSS && window.CSS.supports;
      ['auto', 'manipulation', 'pan-y', 'pan-x', 'pan-x pan-y', 'none'].forEach(function(val) {

          // If css.supports is not supported but there is native touch-action assume it supports
          // all values. This is the case for IE 10 and 11.
          touchMap[val] = cssSupports ? window.CSS.supports('touch-action', val) : true;
      });
      return touchMap;
  }

  /**
   * Recognizer flow explained; *
   * All recognizers have the initial state of POSSIBLE when a input session starts.
   * The definition of a input session is from the first input until the last input, with all it's movement in it. *
   * Example session for mouse-input: mousedown -> mousemove -> mouseup
   *
   * On each recognizing cycle (see Manager.recognize) the .recognize() method is executed
   * which determines with state it should be.
   *
   * If the recognizer has the state FAILED, CANCELLED or RECOGNIZED (equals ENDED), it is reset to
   * POSSIBLE to give it another change on the next cycle.
   *
   *               Possible
   *                  |
   *            +-----+---------------+
   *            |                     |
   *      +-----+-----+               |
   *      |           |               |
   *   Failed      Cancelled          |
   *                          +-------+------+
   *                          |              |
   *                      Recognized       Began
   *                                         |
   *                                      Changed
   *                                         |
   *                                  Ended/Recognized
   */
  var STATE_POSSIBLE = 1;
  var STATE_BEGAN = 2;
  var STATE_CHANGED = 4;
  var STATE_ENDED = 8;
  var STATE_RECOGNIZED = STATE_ENDED;
  var STATE_CANCELLED = 16;
  var STATE_FAILED = 32;

  /**
   * Recognizer
   * Every recognizer needs to extend from this class.
   * @constructor
   * @param {Object} options
   */
  function Recognizer(options) {
      this.options = assign({}, this.defaults, options || {});

      this.id = uniqueId();

      this.manager = null;

      // default is enable true
      this.options.enable = ifUndefined(this.options.enable, true);

      this.state = STATE_POSSIBLE;

      this.simultaneous = {};
      this.requireFail = [];
  }

  Recognizer.prototype = {
      /**
       * @virtual
       * @type {Object}
       */
      defaults: {},

      /**
       * set options
       * @param {Object} options
       * @return {Recognizer}
       */
      set: function(options) {
          assign(this.options, options);

          // also update the touchAction, in case something changed about the directions/enabled state
          this.manager && this.manager.touchAction.update();
          return this;
      },

      /**
       * recognize simultaneous with an other recognizer.
       * @param {Recognizer} otherRecognizer
       * @returns {Recognizer} this
       */
      recognizeWith: function(otherRecognizer) {
          if (invokeArrayArg(otherRecognizer, 'recognizeWith', this)) {
              return this;
          }

          var simultaneous = this.simultaneous;
          otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
          if (!simultaneous[otherRecognizer.id]) {
              simultaneous[otherRecognizer.id] = otherRecognizer;
              otherRecognizer.recognizeWith(this);
          }
          return this;
      },

      /**
       * drop the simultaneous link. it doesnt remove the link on the other recognizer.
       * @param {Recognizer} otherRecognizer
       * @returns {Recognizer} this
       */
      dropRecognizeWith: function(otherRecognizer) {
          if (invokeArrayArg(otherRecognizer, 'dropRecognizeWith', this)) {
              return this;
          }

          otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
          delete this.simultaneous[otherRecognizer.id];
          return this;
      },

      /**
       * recognizer can only run when an other is failing
       * @param {Recognizer} otherRecognizer
       * @returns {Recognizer} this
       */
      requireFailure: function(otherRecognizer) {
          if (invokeArrayArg(otherRecognizer, 'requireFailure', this)) {
              return this;
          }

          var requireFail = this.requireFail;
          otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
          if (inArray(requireFail, otherRecognizer) === -1) {
              requireFail.push(otherRecognizer);
              otherRecognizer.requireFailure(this);
          }
          return this;
      },

      /**
       * drop the requireFailure link. it does not remove the link on the other recognizer.
       * @param {Recognizer} otherRecognizer
       * @returns {Recognizer} this
       */
      dropRequireFailure: function(otherRecognizer) {
          if (invokeArrayArg(otherRecognizer, 'dropRequireFailure', this)) {
              return this;
          }

          otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
          var index = inArray(this.requireFail, otherRecognizer);
          if (index > -1) {
              this.requireFail.splice(index, 1);
          }
          return this;
      },

      /**
       * has require failures boolean
       * @returns {boolean}
       */
      hasRequireFailures: function() {
          return this.requireFail.length > 0;
      },

      /**
       * if the recognizer can recognize simultaneous with an other recognizer
       * @param {Recognizer} otherRecognizer
       * @returns {Boolean}
       */
      canRecognizeWith: function(otherRecognizer) {
          return !!this.simultaneous[otherRecognizer.id];
      },

      /**
       * You should use `tryEmit` instead of `emit` directly to check
       * that all the needed recognizers has failed before emitting.
       * @param {Object} input
       */
      emit: function(input) {
          var self = this;
          var state = this.state;

          function emit(event) {
              self.manager.emit(event, input);
          }

          // 'panstart' and 'panmove'
          if (state < STATE_ENDED) {
              emit(self.options.event + stateStr(state));
          }

          emit(self.options.event); // simple 'eventName' events

          if (input.additionalEvent) { // additional event(panleft, panright, pinchin, pinchout...)
              emit(input.additionalEvent);
          }

          // panend and pancancel
          if (state >= STATE_ENDED) {
              emit(self.options.event + stateStr(state));
          }
      },

      /**
       * Check that all the require failure recognizers has failed,
       * if true, it emits a gesture event,
       * otherwise, setup the state to FAILED.
       * @param {Object} input
       */
      tryEmit: function(input) {
          if (this.canEmit()) {
              return this.emit(input);
          }
          // it's failing anyway
          this.state = STATE_FAILED;
      },

      /**
       * can we emit?
       * @returns {boolean}
       */
      canEmit: function() {
          var i = 0;
          while (i < this.requireFail.length) {
              if (!(this.requireFail[i].state & (STATE_FAILED | STATE_POSSIBLE))) {
                  return false;
              }
              i++;
          }
          return true;
      },

      /**
       * update the recognizer
       * @param {Object} inputData
       */
      recognize: function(inputData) {
          // make a new copy of the inputData
          // so we can change the inputData without messing up the other recognizers
          var inputDataClone = assign({}, inputData);

          // is is enabled and allow recognizing?
          if (!boolOrFn(this.options.enable, [this, inputDataClone])) {
              this.reset();
              this.state = STATE_FAILED;
              return;
          }

          // reset when we've reached the end
          if (this.state & (STATE_RECOGNIZED | STATE_CANCELLED | STATE_FAILED)) {
              this.state = STATE_POSSIBLE;
          }

          this.state = this.process(inputDataClone);

          // the recognizer has recognized a gesture
          // so trigger an event
          if (this.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED | STATE_CANCELLED)) {
              this.tryEmit(inputDataClone);
          }
      },

      /**
       * return the state of the recognizer
       * the actual recognizing happens in this method
       * @virtual
       * @param {Object} inputData
       * @returns {Const} STATE
       */
      process: function(inputData) { }, // jshint ignore:line

      /**
       * return the preferred touch-action
       * @virtual
       * @returns {Array}
       */
      getTouchAction: function() { },

      /**
       * called when the gesture isn't allowed to recognize
       * like when another is being recognized or it is disabled
       * @virtual
       */
      reset: function() { }
  };

  /**
   * get a usable string, used as event postfix
   * @param {Const} state
   * @returns {String} state
   */
  function stateStr(state) {
      if (state & STATE_CANCELLED) {
          return 'cancel';
      } else if (state & STATE_ENDED) {
          return 'end';
      } else if (state & STATE_CHANGED) {
          return 'move';
      } else if (state & STATE_BEGAN) {
          return 'start';
      }
      return '';
  }

  /**
   * direction cons to string
   * @param {Const} direction
   * @returns {String}
   */
  function directionStr(direction) {
      if (direction == DIRECTION_DOWN) {
          return 'down';
      } else if (direction == DIRECTION_UP) {
          return 'up';
      } else if (direction == DIRECTION_LEFT) {
          return 'left';
      } else if (direction == DIRECTION_RIGHT) {
          return 'right';
      }
      return '';
  }

  /**
   * get a recognizer by name if it is bound to a manager
   * @param {Recognizer|String} otherRecognizer
   * @param {Recognizer} recognizer
   * @returns {Recognizer}
   */
  function getRecognizerByNameIfManager(otherRecognizer, recognizer) {
      var manager = recognizer.manager;
      if (manager) {
          return manager.get(otherRecognizer);
      }
      return otherRecognizer;
  }

  /**
   * This recognizer is just used as a base for the simple attribute recognizers.
   * @constructor
   * @extends Recognizer
   */
  function AttrRecognizer() {
      Recognizer.apply(this, arguments);
  }

  inherit(AttrRecognizer, Recognizer, {
      /**
       * @namespace
       * @memberof AttrRecognizer
       */
      defaults: {
          /**
           * @type {Number}
           * @default 1
           */
          pointers: 1
      },

      /**
       * Used to check if it the recognizer receives valid input, like input.distance > 10.
       * @memberof AttrRecognizer
       * @param {Object} input
       * @returns {Boolean} recognized
       */
      attrTest: function(input) {
          var optionPointers = this.options.pointers;
          return optionPointers === 0 || input.pointers.length === optionPointers;
      },

      /**
       * Process the input and return the state for the recognizer
       * @memberof AttrRecognizer
       * @param {Object} input
       * @returns {*} State
       */
      process: function(input) {
          var state = this.state;
          var eventType = input.eventType;

          var isRecognized = state & (STATE_BEGAN | STATE_CHANGED);
          var isValid = this.attrTest(input);

          // on cancel input and we've recognized before, return STATE_CANCELLED
          if (isRecognized && (eventType & INPUT_CANCEL || !isValid)) {
              return state | STATE_CANCELLED;
          } else if (isRecognized || isValid) {
              if (eventType & INPUT_END) {
                  return state | STATE_ENDED;
              } else if (!(state & STATE_BEGAN)) {
                  return STATE_BEGAN;
              }
              return state | STATE_CHANGED;
          }
          return STATE_FAILED;
      }
  });

  /**
   * Pan
   * Recognized when the pointer is down and moved in the allowed direction.
   * @constructor
   * @extends AttrRecognizer
   */
  function PanRecognizer() {
      AttrRecognizer.apply(this, arguments);

      this.pX = null;
      this.pY = null;
  }

  inherit(PanRecognizer, AttrRecognizer, {
      /**
       * @namespace
       * @memberof PanRecognizer
       */
      defaults: {
          event: 'pan',
          threshold: 10,
          pointers: 1,
          direction: DIRECTION_ALL
      },

      getTouchAction: function() {
          var direction = this.options.direction;
          var actions = [];
          if (direction & DIRECTION_HORIZONTAL) {
              actions.push(TOUCH_ACTION_PAN_Y);
          }
          if (direction & DIRECTION_VERTICAL) {
              actions.push(TOUCH_ACTION_PAN_X);
          }
          return actions;
      },

      directionTest: function(input) {
          var options = this.options;
          var hasMoved = true;
          var distance = input.distance;
          var direction = input.direction;
          var x = input.deltaX;
          var y = input.deltaY;

          // lock to axis?
          if (!(direction & options.direction)) {
              if (options.direction & DIRECTION_HORIZONTAL) {
                  direction = (x === 0) ? DIRECTION_NONE : (x < 0) ? DIRECTION_LEFT : DIRECTION_RIGHT;
                  hasMoved = x != this.pX;
                  distance = Math.abs(input.deltaX);
              } else {
                  direction = (y === 0) ? DIRECTION_NONE : (y < 0) ? DIRECTION_UP : DIRECTION_DOWN;
                  hasMoved = y != this.pY;
                  distance = Math.abs(input.deltaY);
              }
          }
          input.direction = direction;
          return hasMoved && distance > options.threshold && direction & options.direction;
      },

      attrTest: function(input) {
          return AttrRecognizer.prototype.attrTest.call(this, input) &&
              (this.state & STATE_BEGAN || (!(this.state & STATE_BEGAN) && this.directionTest(input)));
      },

      emit: function(input) {

          this.pX = input.deltaX;
          this.pY = input.deltaY;

          var direction = directionStr(input.direction);

          if (direction) {
              input.additionalEvent = this.options.event + direction;
          }
          this._super.emit.call(this, input);
      }
  });

  /**
   * Pinch
   * Recognized when two or more pointers are moving toward (zoom-in) or away from each other (zoom-out).
   * @constructor
   * @extends AttrRecognizer
   */
  function PinchRecognizer() {
      AttrRecognizer.apply(this, arguments);
  }

  inherit(PinchRecognizer, AttrRecognizer, {
      /**
       * @namespace
       * @memberof PinchRecognizer
       */
      defaults: {
          event: 'pinch',
          threshold: 0,
          pointers: 2
      },

      getTouchAction: function() {
          return [TOUCH_ACTION_NONE];
      },

      attrTest: function(input) {
          return this._super.attrTest.call(this, input) &&
              (Math.abs(input.scale - 1) > this.options.threshold || this.state & STATE_BEGAN);
      },

      emit: function(input) {
          if (input.scale !== 1) {
              var inOut = input.scale < 1 ? 'in' : 'out';
              input.additionalEvent = this.options.event + inOut;
          }
          this._super.emit.call(this, input);
      }
  });

  /**
   * Press
   * Recognized when the pointer is down for x ms without any movement.
   * @constructor
   * @extends Recognizer
   */
  function PressRecognizer() {
      Recognizer.apply(this, arguments);

      this._timer = null;
      this._input = null;
  }

  inherit(PressRecognizer, Recognizer, {
      /**
       * @namespace
       * @memberof PressRecognizer
       */
      defaults: {
          event: 'press',
          pointers: 1,
          time: 251, // minimal time of the pointer to be pressed
          threshold: 9 // a minimal movement is ok, but keep it low
      },

      getTouchAction: function() {
          return [TOUCH_ACTION_AUTO];
      },

      process: function(input) {
          var options = this.options;
          var validPointers = input.pointers.length === options.pointers;
          var validMovement = input.distance < options.threshold;
          var validTime = input.deltaTime > options.time;

          this._input = input;

          // we only allow little movement
          // and we've reached an end event, so a tap is possible
          if (!validMovement || !validPointers || (input.eventType & (INPUT_END | INPUT_CANCEL) && !validTime)) {
              this.reset();
          } else if (input.eventType & INPUT_START) {
              this.reset();
              this._timer = setTimeoutContext(function() {
                  this.state = STATE_RECOGNIZED;
                  this.tryEmit();
              }, options.time, this);
          } else if (input.eventType & INPUT_END) {
              return STATE_RECOGNIZED;
          }
          return STATE_FAILED;
      },

      reset: function() {
          clearTimeout(this._timer);
      },

      emit: function(input) {
          if (this.state !== STATE_RECOGNIZED) {
              return;
          }

          if (input && (input.eventType & INPUT_END)) {
              this.manager.emit(this.options.event + 'up', input);
          } else {
              this._input.timeStamp = now();
              this.manager.emit(this.options.event, this._input);
          }
      }
  });

  /**
   * Rotate
   * Recognized when two or more pointer are moving in a circular motion.
   * @constructor
   * @extends AttrRecognizer
   */
  function RotateRecognizer() {
      AttrRecognizer.apply(this, arguments);
  }

  inherit(RotateRecognizer, AttrRecognizer, {
      /**
       * @namespace
       * @memberof RotateRecognizer
       */
      defaults: {
          event: 'rotate',
          threshold: 0,
          pointers: 2
      },

      getTouchAction: function() {
          return [TOUCH_ACTION_NONE];
      },

      attrTest: function(input) {
          return this._super.attrTest.call(this, input) &&
              (Math.abs(input.rotation) > this.options.threshold || this.state & STATE_BEGAN);
      }
  });

  /**
   * Swipe
   * Recognized when the pointer is moving fast (velocity), with enough distance in the allowed direction.
   * @constructor
   * @extends AttrRecognizer
   */
  function SwipeRecognizer() {
      AttrRecognizer.apply(this, arguments);
  }

  inherit(SwipeRecognizer, AttrRecognizer, {
      /**
       * @namespace
       * @memberof SwipeRecognizer
       */
      defaults: {
          event: 'swipe',
          threshold: 10,
          velocity: 0.3,
          direction: DIRECTION_HORIZONTAL | DIRECTION_VERTICAL,
          pointers: 1
      },

      getTouchAction: function() {
          return PanRecognizer.prototype.getTouchAction.call(this);
      },

      attrTest: function(input) {
          var direction = this.options.direction;
          var velocity;

          if (direction & (DIRECTION_HORIZONTAL | DIRECTION_VERTICAL)) {
              velocity = input.overallVelocity;
          } else if (direction & DIRECTION_HORIZONTAL) {
              velocity = input.overallVelocityX;
          } else if (direction & DIRECTION_VERTICAL) {
              velocity = input.overallVelocityY;
          }

          return this._super.attrTest.call(this, input) &&
              direction & input.offsetDirection &&
              input.distance > this.options.threshold &&
              input.maxPointers == this.options.pointers &&
              abs(velocity) > this.options.velocity && input.eventType & INPUT_END;
      },

      emit: function(input) {
          var direction = directionStr(input.offsetDirection);
          if (direction) {
              this.manager.emit(this.options.event + direction, input);
          }

          this.manager.emit(this.options.event, input);
      }
  });

  /**
   * A tap is ecognized when the pointer is doing a small tap/click. Multiple taps are recognized if they occur
   * between the given interval and position. The delay option can be used to recognize multi-taps without firing
   * a single tap.
   *
   * The eventData from the emitted event contains the property `tapCount`, which contains the amount of
   * multi-taps being recognized.
   * @constructor
   * @extends Recognizer
   */
  function TapRecognizer() {
      Recognizer.apply(this, arguments);

      // previous time and center,
      // used for tap counting
      this.pTime = false;
      this.pCenter = false;

      this._timer = null;
      this._input = null;
      this.count = 0;
  }

  inherit(TapRecognizer, Recognizer, {
      /**
       * @namespace
       * @memberof PinchRecognizer
       */
      defaults: {
          event: 'tap',
          pointers: 1,
          taps: 1,
          interval: 300, // max time between the multi-tap taps
          time: 250, // max time of the pointer to be down (like finger on the screen)
          threshold: 9, // a minimal movement is ok, but keep it low
          posThreshold: 10 // a multi-tap can be a bit off the initial position
      },

      getTouchAction: function() {
          return [TOUCH_ACTION_MANIPULATION];
      },

      process: function(input) {
          var options = this.options;

          var validPointers = input.pointers.length === options.pointers;
          var validMovement = input.distance < options.threshold;
          var validTouchTime = input.deltaTime < options.time;

          this.reset();

          if ((input.eventType & INPUT_START) && (this.count === 0)) {
              return this.failTimeout();
          }

          // we only allow little movement
          // and we've reached an end event, so a tap is possible
          if (validMovement && validTouchTime && validPointers) {
              if (input.eventType != INPUT_END) {
                  return this.failTimeout();
              }

              var validInterval = this.pTime ? (input.timeStamp - this.pTime < options.interval) : true;
              var validMultiTap = !this.pCenter || getDistance(this.pCenter, input.center) < options.posThreshold;

              this.pTime = input.timeStamp;
              this.pCenter = input.center;

              if (!validMultiTap || !validInterval) {
                  this.count = 1;
              } else {
                  this.count += 1;
              }

              this._input = input;

              // if tap count matches we have recognized it,
              // else it has began recognizing...
              var tapCount = this.count % options.taps;
              if (tapCount === 0) {
                  // no failing requirements, immediately trigger the tap event
                  // or wait as long as the multitap interval to trigger
                  if (!this.hasRequireFailures()) {
                      return STATE_RECOGNIZED;
                  } else {
                      this._timer = setTimeoutContext(function() {
                          this.state = STATE_RECOGNIZED;
                          this.tryEmit();
                      }, options.interval, this);
                      return STATE_BEGAN;
                  }
              }
          }
          return STATE_FAILED;
      },

      failTimeout: function() {
          this._timer = setTimeoutContext(function() {
              this.state = STATE_FAILED;
          }, this.options.interval, this);
          return STATE_FAILED;
      },

      reset: function() {
          clearTimeout(this._timer);
      },

      emit: function() {
          if (this.state == STATE_RECOGNIZED) {
              this._input.tapCount = this.count;
              this.manager.emit(this.options.event, this._input);
          }
      }
  });

  /**
   * Simple way to create a manager with a default set of recognizers.
   * @param {HTMLElement} element
   * @param {Object} [options]
   * @constructor
   */
  function Hammer(element, options) {
      options = options || {};
      options.recognizers = ifUndefined(options.recognizers, Hammer.defaults.preset);
      return new Manager(element, options);
  }

  /**
   * @const {string}
   */
  Hammer.VERSION = '2.0.7';

  /**
   * default settings
   * @namespace
   */
  Hammer.defaults = {
      /**
       * set if DOM events are being triggered.
       * But this is slower and unused by simple implementations, so disabled by default.
       * @type {Boolean}
       * @default false
       */
      domEvents: false,

      /**
       * The value for the touchAction property/fallback.
       * When set to `compute` it will magically set the correct value based on the added recognizers.
       * @type {String}
       * @default compute
       */
      touchAction: TOUCH_ACTION_COMPUTE,

      /**
       * @type {Boolean}
       * @default true
       */
      enable: true,

      /**
       * EXPERIMENTAL FEATURE -- can be removed/changed
       * Change the parent input target element.
       * If Null, then it is being set the to main element.
       * @type {Null|EventTarget}
       * @default null
       */
      inputTarget: null,

      /**
       * force an input class
       * @type {Null|Function}
       * @default null
       */
      inputClass: null,

      /**
       * Default recognizer setup when calling `Hammer()`
       * When creating a new Manager these will be skipped.
       * @type {Array}
       */
      preset: [
          // RecognizerClass, options, [recognizeWith, ...], [requireFailure, ...]
          [RotateRecognizer, {enable: false}],
          [PinchRecognizer, {enable: false}, ['rotate']],
          [SwipeRecognizer, {direction: DIRECTION_HORIZONTAL}],
          [PanRecognizer, {direction: DIRECTION_HORIZONTAL}, ['swipe']],
          [TapRecognizer],
          [TapRecognizer, {event: 'doubletap', taps: 2}, ['tap']],
          [PressRecognizer]
      ],

      /**
       * Some CSS properties can be used to improve the working of Hammer.
       * Add them to this method and they will be set when creating a new Manager.
       * @namespace
       */
      cssProps: {
          /**
           * Disables text selection to improve the dragging gesture. Mainly for desktop browsers.
           * @type {String}
           * @default 'none'
           */
          userSelect: 'none',

          /**
           * Disable the Windows Phone grippers when pressing an element.
           * @type {String}
           * @default 'none'
           */
          touchSelect: 'none',

          /**
           * Disables the default callout shown when you touch and hold a touch target.
           * On iOS, when you touch and hold a touch target such as a link, Safari displays
           * a callout containing information about the link. This property allows you to disable that callout.
           * @type {String}
           * @default 'none'
           */
          touchCallout: 'none',

          /**
           * Specifies whether zooming is enabled. Used by IE10>
           * @type {String}
           * @default 'none'
           */
          contentZooming: 'none',

          /**
           * Specifies that an entire element should be draggable instead of its contents. Mainly for desktop browsers.
           * @type {String}
           * @default 'none'
           */
          userDrag: 'none',

          /**
           * Overrides the highlight color shown when the user taps a link or a JavaScript
           * clickable element in iOS. This property obeys the alpha value, if specified.
           * @type {String}
           * @default 'rgba(0,0,0,0)'
           */
          tapHighlightColor: 'rgba(0,0,0,0)'
      }
  };

  var STOP = 1;
  var FORCED_STOP = 2;

  /**
   * Manager
   * @param {HTMLElement} element
   * @param {Object} [options]
   * @constructor
   */
  function Manager(element, options) {
      this.options = assign({}, Hammer.defaults, options || {});

      this.options.inputTarget = this.options.inputTarget || element;

      this.handlers = {};
      this.session = {};
      this.recognizers = [];
      this.oldCssProps = {};

      this.element = element;
      this.input = createInputInstance(this);
      this.touchAction = new TouchAction(this, this.options.touchAction);

      toggleCssProps(this, true);

      each(this.options.recognizers, function(item) {
          var recognizer = this.add(new (item[0])(item[1]));
          item[2] && recognizer.recognizeWith(item[2]);
          item[3] && recognizer.requireFailure(item[3]);
      }, this);
  }

  Manager.prototype = {
      /**
       * set options
       * @param {Object} options
       * @returns {Manager}
       */
      set: function(options) {
          assign(this.options, options);

          // Options that need a little more setup
          if (options.touchAction) {
              this.touchAction.update();
          }
          if (options.inputTarget) {
              // Clean up existing event listeners and reinitialize
              this.input.destroy();
              this.input.target = options.inputTarget;
              this.input.init();
          }
          return this;
      },

      /**
       * stop recognizing for this session.
       * This session will be discarded, when a new [input]start event is fired.
       * When forced, the recognizer cycle is stopped immediately.
       * @param {Boolean} [force]
       */
      stop: function(force) {
          this.session.stopped = force ? FORCED_STOP : STOP;
      },

      /**
       * run the recognizers!
       * called by the inputHandler function on every movement of the pointers (touches)
       * it walks through all the recognizers and tries to detect the gesture that is being made
       * @param {Object} inputData
       */
      recognize: function(inputData) {
          var session = this.session;
          if (session.stopped) {
              return;
          }

          // run the touch-action polyfill
          this.touchAction.preventDefaults(inputData);

          var recognizer;
          var recognizers = this.recognizers;

          // this holds the recognizer that is being recognized.
          // so the recognizer's state needs to be BEGAN, CHANGED, ENDED or RECOGNIZED
          // if no recognizer is detecting a thing, it is set to `null`
          var curRecognizer = session.curRecognizer;

          // reset when the last recognizer is recognized
          // or when we're in a new session
          if (!curRecognizer || (curRecognizer && curRecognizer.state & STATE_RECOGNIZED)) {
              curRecognizer = session.curRecognizer = null;
          }

          var i = 0;
          while (i < recognizers.length) {
              recognizer = recognizers[i];

              // find out if we are allowed try to recognize the input for this one.
              // 1.   allow if the session is NOT forced stopped (see the .stop() method)
              // 2.   allow if we still haven't recognized a gesture in this session, or the this recognizer is the one
              //      that is being recognized.
              // 3.   allow if the recognizer is allowed to run simultaneous with the current recognized recognizer.
              //      this can be setup with the `recognizeWith()` method on the recognizer.
              if (session.stopped !== FORCED_STOP && ( // 1
                      !curRecognizer || recognizer == curRecognizer || // 2
                      recognizer.canRecognizeWith(curRecognizer))) { // 3
                  recognizer.recognize(inputData);
              } else {
                  recognizer.reset();
              }

              // if the recognizer has been recognizing the input as a valid gesture, we want to store this one as the
              // current active recognizer. but only if we don't already have an active recognizer
              if (!curRecognizer && recognizer.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED)) {
                  curRecognizer = session.curRecognizer = recognizer;
              }
              i++;
          }
      },

      /**
       * get a recognizer by its event name.
       * @param {Recognizer|String} recognizer
       * @returns {Recognizer|Null}
       */
      get: function(recognizer) {
          if (recognizer instanceof Recognizer) {
              return recognizer;
          }

          var recognizers = this.recognizers;
          for (var i = 0; i < recognizers.length; i++) {
              if (recognizers[i].options.event == recognizer) {
                  return recognizers[i];
              }
          }
          return null;
      },

      /**
       * add a recognizer to the manager
       * existing recognizers with the same event name will be removed
       * @param {Recognizer} recognizer
       * @returns {Recognizer|Manager}
       */
      add: function(recognizer) {
          if (invokeArrayArg(recognizer, 'add', this)) {
              return this;
          }

          // remove existing
          var existing = this.get(recognizer.options.event);
          if (existing) {
              this.remove(existing);
          }

          this.recognizers.push(recognizer);
          recognizer.manager = this;

          this.touchAction.update();
          return recognizer;
      },

      /**
       * remove a recognizer by name or instance
       * @param {Recognizer|String} recognizer
       * @returns {Manager}
       */
      remove: function(recognizer) {
          if (invokeArrayArg(recognizer, 'remove', this)) {
              return this;
          }

          recognizer = this.get(recognizer);

          // let's make sure this recognizer exists
          if (recognizer) {
              var recognizers = this.recognizers;
              var index = inArray(recognizers, recognizer);

              if (index !== -1) {
                  recognizers.splice(index, 1);
                  this.touchAction.update();
              }
          }

          return this;
      },

      /**
       * bind event
       * @param {String} events
       * @param {Function} handler
       * @returns {EventEmitter} this
       */
      on: function(events, handler) {
          if (events === undefined$1) {
              return;
          }
          if (handler === undefined$1) {
              return;
          }

          var handlers = this.handlers;
          each(splitStr(events), function(event) {
              handlers[event] = handlers[event] || [];
              handlers[event].push(handler);
          });
          return this;
      },

      /**
       * unbind event, leave emit blank to remove all handlers
       * @param {String} events
       * @param {Function} [handler]
       * @returns {EventEmitter} this
       */
      off: function(events, handler) {
          if (events === undefined$1) {
              return;
          }

          var handlers = this.handlers;
          each(splitStr(events), function(event) {
              if (!handler) {
                  delete handlers[event];
              } else {
                  handlers[event] && handlers[event].splice(inArray(handlers[event], handler), 1);
              }
          });
          return this;
      },

      /**
       * emit event to the listeners
       * @param {String} event
       * @param {Object} data
       */
      emit: function(event, data) {
          // we also want to trigger dom events
          if (this.options.domEvents) {
              triggerDomEvent(event, data);
          }

          // no handlers, so skip it all
          var handlers = this.handlers[event] && this.handlers[event].slice();
          if (!handlers || !handlers.length) {
              return;
          }

          data.type = event;
          data.preventDefault = function() {
              data.srcEvent.preventDefault();
          };

          var i = 0;
          while (i < handlers.length) {
              handlers[i](data);
              i++;
          }
      },

      /**
       * destroy the manager and unbinds all events
       * it doesn't unbind dom events, that is the user own responsibility
       */
      destroy: function() {
          this.element && toggleCssProps(this, false);

          this.handlers = {};
          this.session = {};
          this.input.destroy();
          this.element = null;
      }
  };

  /**
   * add/remove the css properties as defined in manager.options.cssProps
   * @param {Manager} manager
   * @param {Boolean} add
   */
  function toggleCssProps(manager, add) {
      var element = manager.element;
      if (!element.style) {
          return;
      }
      var prop;
      each(manager.options.cssProps, function(value, name) {
          prop = prefixed(element.style, name);
          if (add) {
              manager.oldCssProps[prop] = element.style[prop];
              element.style[prop] = value;
          } else {
              element.style[prop] = manager.oldCssProps[prop] || '';
          }
      });
      if (!add) {
          manager.oldCssProps = {};
      }
  }

  /**
   * trigger dom event
   * @param {String} event
   * @param {Object} data
   */
  function triggerDomEvent(event, data) {
      var gestureEvent = document.createEvent('Event');
      gestureEvent.initEvent(event, true, true);
      gestureEvent.gesture = data;
      data.target.dispatchEvent(gestureEvent);
  }

  assign(Hammer, {
      INPUT_START: INPUT_START,
      INPUT_MOVE: INPUT_MOVE,
      INPUT_END: INPUT_END,
      INPUT_CANCEL: INPUT_CANCEL,

      STATE_POSSIBLE: STATE_POSSIBLE,
      STATE_BEGAN: STATE_BEGAN,
      STATE_CHANGED: STATE_CHANGED,
      STATE_ENDED: STATE_ENDED,
      STATE_RECOGNIZED: STATE_RECOGNIZED,
      STATE_CANCELLED: STATE_CANCELLED,
      STATE_FAILED: STATE_FAILED,

      DIRECTION_NONE: DIRECTION_NONE,
      DIRECTION_LEFT: DIRECTION_LEFT,
      DIRECTION_RIGHT: DIRECTION_RIGHT,
      DIRECTION_UP: DIRECTION_UP,
      DIRECTION_DOWN: DIRECTION_DOWN,
      DIRECTION_HORIZONTAL: DIRECTION_HORIZONTAL,
      DIRECTION_VERTICAL: DIRECTION_VERTICAL,
      DIRECTION_ALL: DIRECTION_ALL,

      Manager: Manager,
      Input: Input,
      TouchAction: TouchAction,

      TouchInput: TouchInput,
      MouseInput: MouseInput,
      PointerEventInput: PointerEventInput,
      TouchMouseInput: TouchMouseInput,
      SingleTouchInput: SingleTouchInput,

      Recognizer: Recognizer,
      AttrRecognizer: AttrRecognizer,
      Tap: TapRecognizer,
      Pan: PanRecognizer,
      Swipe: SwipeRecognizer,
      Pinch: PinchRecognizer,
      Rotate: RotateRecognizer,
      Press: PressRecognizer,

      on: addEventListeners,
      off: removeEventListeners,
      each: each,
      merge: merge,
      extend: extend,
      assign: assign,
      inherit: inherit,
      bindFn: bindFn,
      prefixed: prefixed
  });

  // this prevents errors when Hammer is loaded in the presence of an AMD
  //  style loader but by script tag, not by the loader.
  var freeGlobal = (typeof window !== 'undefined' ? window : (typeof self !== 'undefined' ? self : {})); // jshint ignore:line
  freeGlobal.Hammer = Hammer;

  if (typeof undefined$1 === 'function' && undefined$1.amd) {
      undefined$1(function() {
          return Hammer;
      });
  } else if ( module.exports) {
      module.exports = Hammer;
  } else {
      window[exportName] = Hammer;
  }

  })(window, document, 'Hammer');
  });

  var crypt = createCommonjsModule(function (module) {
  (function() {
    var base64map
        = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',

    crypt = {
      // Bit-wise rotation left
      rotl: function(n, b) {
        return (n << b) | (n >>> (32 - b));
      },

      // Bit-wise rotation right
      rotr: function(n, b) {
        return (n << (32 - b)) | (n >>> b);
      },

      // Swap big-endian to little-endian and vice versa
      endian: function(n) {
        // If number given, swap endian
        if (n.constructor == Number) {
          return crypt.rotl(n, 8) & 0x00FF00FF | crypt.rotl(n, 24) & 0xFF00FF00;
        }

        // Else, assume array and swap all items
        for (var i = 0; i < n.length; i++)
          n[i] = crypt.endian(n[i]);
        return n;
      },

      // Generate an array of any length of random bytes
      randomBytes: function(n) {
        for (var bytes = []; n > 0; n--)
          bytes.push(Math.floor(Math.random() * 256));
        return bytes;
      },

      // Convert a byte array to big-endian 32-bit words
      bytesToWords: function(bytes) {
        for (var words = [], i = 0, b = 0; i < bytes.length; i++, b += 8)
          words[b >>> 5] |= bytes[i] << (24 - b % 32);
        return words;
      },

      // Convert big-endian 32-bit words to a byte array
      wordsToBytes: function(words) {
        for (var bytes = [], b = 0; b < words.length * 32; b += 8)
          bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xFF);
        return bytes;
      },

      // Convert a byte array to a hex string
      bytesToHex: function(bytes) {
        for (var hex = [], i = 0; i < bytes.length; i++) {
          hex.push((bytes[i] >>> 4).toString(16));
          hex.push((bytes[i] & 0xF).toString(16));
        }
        return hex.join('');
      },

      // Convert a hex string to a byte array
      hexToBytes: function(hex) {
        for (var bytes = [], c = 0; c < hex.length; c += 2)
          bytes.push(parseInt(hex.substr(c, 2), 16));
        return bytes;
      },

      // Convert a byte array to a base-64 string
      bytesToBase64: function(bytes) {
        for (var base64 = [], i = 0; i < bytes.length; i += 3) {
          var triplet = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
          for (var j = 0; j < 4; j++)
            if (i * 8 + j * 6 <= bytes.length * 8)
              base64.push(base64map.charAt((triplet >>> 6 * (3 - j)) & 0x3F));
            else
              base64.push('=');
        }
        return base64.join('');
      },

      // Convert a base-64 string to a byte array
      base64ToBytes: function(base64) {
        // Remove non-base-64 characters
        base64 = base64.replace(/[^A-Z0-9+\/]/ig, '');

        for (var bytes = [], i = 0, imod4 = 0; i < base64.length;
            imod4 = ++i % 4) {
          if (imod4 == 0) continue;
          bytes.push(((base64map.indexOf(base64.charAt(i - 1))
              & (Math.pow(2, -2 * imod4 + 8) - 1)) << (imod4 * 2))
              | (base64map.indexOf(base64.charAt(i)) >>> (6 - imod4 * 2)));
        }
        return bytes;
      }
    };

    module.exports = crypt;
  })();
  });

  var charenc = {
    // UTF-8 encoding
    utf8: {
      // Convert a string to a byte array
      stringToBytes: function(str) {
        return charenc.bin.stringToBytes(unescape(encodeURIComponent(str)));
      },

      // Convert a byte array to a string
      bytesToString: function(bytes) {
        return decodeURIComponent(escape(charenc.bin.bytesToString(bytes)));
      }
    },

    // Binary encoding
    bin: {
      // Convert a string to a byte array
      stringToBytes: function(str) {
        for (var bytes = [], i = 0; i < str.length; i++)
          bytes.push(str.charCodeAt(i) & 0xFF);
        return bytes;
      },

      // Convert a byte array to a string
      bytesToString: function(bytes) {
        for (var str = [], i = 0; i < bytes.length; i++)
          str.push(String.fromCharCode(bytes[i]));
        return str.join('');
      }
    }
  };

  var charenc_1 = charenc;

  var sha1 = createCommonjsModule(function (module) {
  (function() {
    var crypt$1 = crypt,
        utf8 = charenc_1.utf8,
        bin = charenc_1.bin,

    // The core
    sha1 = function (message) {
      // Convert to byte array
      if (message.constructor == String)
        message = utf8.stringToBytes(message);
      else if (typeof Buffer !== 'undefined' && typeof Buffer.isBuffer == 'function' && Buffer.isBuffer(message))
        message = Array.prototype.slice.call(message, 0);
      else if (!Array.isArray(message))
        message = message.toString();

      // otherwise assume byte array

      var m  = crypt$1.bytesToWords(message),
          l  = message.length * 8,
          w  = [],
          H0 =  1732584193,
          H1 = -271733879,
          H2 = -1732584194,
          H3 =  271733878,
          H4 = -1009589776;

      // Padding
      m[l >> 5] |= 0x80 << (24 - l % 32);
      m[((l + 64 >>> 9) << 4) + 15] = l;

      for (var i = 0; i < m.length; i += 16) {
        var a = H0,
            b = H1,
            c = H2,
            d = H3,
            e = H4;

        for (var j = 0; j < 80; j++) {

          if (j < 16)
            w[j] = m[i + j];
          else {
            var n = w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16];
            w[j] = (n << 1) | (n >>> 31);
          }

          var t = ((H0 << 5) | (H0 >>> 27)) + H4 + (w[j] >>> 0) + (
                  j < 20 ? (H1 & H2 | ~H1 & H3) + 1518500249 :
                  j < 40 ? (H1 ^ H2 ^ H3) + 1859775393 :
                  j < 60 ? (H1 & H2 | H1 & H3 | H2 & H3) - 1894007588 :
                           (H1 ^ H2 ^ H3) - 899497514);

          H4 = H3;
          H3 = H2;
          H2 = (H1 << 30) | (H1 >>> 2);
          H1 = H0;
          H0 = t;
        }

        H0 += a;
        H1 += b;
        H2 += c;
        H3 += d;
        H4 += e;
      }

      return [H0, H1, H2, H3, H4];
    },

    // Public API
    api = function (message, options) {
      var digestbytes = crypt$1.wordsToBytes(sha1(message));
      return options && options.asBytes ? digestbytes :
          options && options.asString ? bin.bytesToString(digestbytes) :
          crypt$1.bytesToHex(digestbytes);
    };

    api._blocksize = 16;
    api._digestsize = 20;

    module.exports = api;
  })();
  });

  var hash = createCommonjsModule(function (module, exports) {
  var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
      return (mod && mod.__esModule) ? mod : { "default": mod };
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  const sha1_1 = __importDefault(sha1);
  // This is used to ensure that no hash begins with a number, since CSS selectors cant start with numbers
  const prefix = 'brynja-';
  exports.objHash = (obj) => prefix + sha1_1.default(JSON.stringify(obj));
  });

  unwrapExports(hash);
  var hash_1 = hash.objHash;

  var builder = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });

  exports.newVNode = (ctx = {}) => (Object.assign({ tag: '', value: null, text: '', events: {}, props: {}, children: [] }, ctx));
  function buildNode(tagType, builder, customOperations) {
      const ctx = exports.newVNode({
          tag: tagType,
      });
      let styles = {};
      const builderCtx = Object.assign({ style(styleObject) {
              const styleHash = hash.objHash(styleObject);
              styles[styleHash] = styleObject;
              this.class([styleHash]);
              return this;
          },
          on(eventName, handler) {
              if (eventName in ctx.events) {
                  ctx.events[eventName].push(handler);
              }
              else {
                  ctx.events[eventName] = [handler];
              }
              return this;
          },
          child(tagType, builder) {
              const [child, childStyles] = buildNode(tagType, builder, customOperations);
              ctx.children.push(child);
              styles = Object.assign(Object.assign({}, styles), childStyles);
              return this;
          },
          children(tagType, count, builder) {
              for (let __i = 0; __i < count; __i++) {
                  const [child, childStyles] = buildNode(tagType, (_) => builder(_, __i), customOperations);
                  ctx.children.push(child);
                  styles = Object.assign(Object.assign({}, styles), childStyles);
              }
              return this;
          },
          when(booleanExpression, then_builder, else_builder) {
              if (booleanExpression) {
                  then_builder(this);
              }
              else if (else_builder) {
                  else_builder(this);
              }
              return this;
          },
          while(predicate, builder) {
              for (let i = 0; predicate(i); i++) {
                  builder(this, i);
              }
              return this;
          },
          do(...builders) {
              builders.forEach((builder) => builder(this));
              return this;
          },
          value(value) {
              ctx.value = value;
              return this;
          },
          text(value) {
              ctx.text = value;
              return this;
          },
          prop(key, value) {
              ctx.props[key] = value;
              return this;
          },
          id(value) {
              ctx.props.id = value;
              return this;
          },
          class(valuesArr) {
              if (!('class' in ctx.props)) {
                  ctx.props.class = valuesArr.join(' ');
              }
              else {
                  ctx.props.class = [...ctx.props.class.split(' '), ...valuesArr].join(' ');
              }
              return this;
          },
          name(value) {
              ctx.props.name = value;
              return this;
          },
          peek(callback) {
              function ctxProxy(ctx) {
                  return {
                      tag: ctx.tag,
                      text: ctx.text,
                      value: ctx.value,
                      props: ctx.props,
                      events: ctx.events,
                      children: new Proxy([], {
                          get: (arr, key) => {
                              if (key === 'length') {
                                  return ctx.children.length;
                              }
                              else if (!isNaN(parseFloat(key.toString()))) {
                                  return ctxProxy(ctx.children[key]);
                              }
                              else {
                                  return arr[key];
                              }
                          },
                      }),
                  };
              }
              callback(ctxProxy(ctx));
              return this;
          } }, Object.keys(customOperations).reduce((res, k) => (Object.assign(Object.assign({}, res), { [k]: (...args) => {
              customOperations[k](...args)(builderCtx);
              return builderCtx;
          } })), {}));
      builder(builderCtx);
      return [ctx, styles];
  }
  exports.buildNode = buildNode;
  });

  unwrapExports(builder);
  var builder_1 = builder.newVNode;
  var builder_2 = builder.buildNode;

  var renderNode_1 = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  function renderNode(node) {
      const elem = document.createElement(node.tag);
      if (node.value) {
          // @ts-ignore
          elem.value = node.value;
          elem.setAttribute('value', '' + node.value);
      }
      if (node.text !== '') {
          const $text = document.createTextNode(node.text);
          elem.appendChild($text);
      }
      Object.keys(node.props).forEach((prop) => {
          elem.setAttribute(prop, node.props[prop]);
      });
      Object.keys(node.events).forEach((event) => {
          elem.addEventListener(event, (e) => {
              node.events[event].forEach((cb) => {
                  cb(e);
              });
          });
      });
      node.children.forEach((node) => {
          elem.appendChild(renderNode(node));
      });
      return elem;
  }
  exports.renderNode = renderNode;
  });

  unwrapExports(renderNode_1);
  var renderNode_2 = renderNode_1.renderNode;

  var renderStyles = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  function renderStyle(styles) {
      const renderedStyles = Object.keys(styles).reduce((res, className) => {
          const allSelectors = Object.keys(styles[className]).reduce((res, key) => {
              if (key.startsWith(':')) {
                  // Extract pseudoClasses
                  res[className + key] = styles[className][key];
              }
              else {
                  // Pass the property along
                  res[className] = Object.assign(Object.assign({}, res[className]), { [key]: styles[className][key] });
              }
              return res;
          }, {});
          const renderStyleObject = (className, styleObj) => {
              return `.${className}{${Object.keys(styleObj).map((k) => `${k}: ${styleObj[k]};`).join('')}}`;
          };
          // Render all styles for the current className (including pseudo selectors)
          Object.keys(allSelectors).forEach((selector) => {
              res += renderStyleObject(selector, allSelectors[selector]);
          });
          return res;
      }, '');
      return renderedStyles;
  }
  exports.renderStyle = renderStyle;
  });

  unwrapExports(renderStyles);
  var renderStyles_1 = renderStyles.renderStyle;

  var updateNode_1 = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });

  const TEXT_NODE = 3; // https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
  function updateNode(newNode, oldNode, elem) {
      if (newNode.tag.toLowerCase() !== oldNode.tag.toLowerCase()) {
          // Different tags requires a re-render
          const newElem = renderNode_1.renderNode(newNode);
          elem.parentNode.replaceChild(newElem, elem);
      }
      // #region Update value
      if (newNode.value && newNode.value !== oldNode.value) {
          // @ts-ignore
          elem.value = newNode.value;
          elem.setAttribute('value', '' + newNode.value);
      }
      else if (newNode.value !== oldNode.value) {
          // @ts-ignore
          elem.value = undefined;
          elem.removeAttribute('value');
      }
      // #endregion
      // #region Update text node
      if (oldNode.text === newNode.text) ;
      else if (oldNode.text === '' && newNode.text !== '') {
          // Add text
          const $text = document.createTextNode(newNode.text);
          elem.appendChild($text);
      }
      else if (oldNode.text !== '') {
          if (elem.firstChild.nodeType !== TEXT_NODE) {
              // This should never happen. So no need to test for it?
              /* istanbul ignore next */
              throw new Error('Unexpected "none text node" as first child of element: ' + elem);
          }
          if (newNode.text === '') {
              // Remove text
              elem.firstChild.remove();
          }
          else if (newNode.text !== '') {
              // Update text
              elem.firstChild.textContent = newNode.text;
          }
      }
      // #endregion
      // #region Update props
      new Set([
          ...Object.keys(oldNode.props),
          ...Object.keys(newNode.props),
      ]).forEach((prop) => {
          if (prop in oldNode.props && !(prop in newNode.props)) {
              // Remove prop
              elem.removeAttribute(prop);
          }
          else if (prop in newNode.props && !(prop in oldNode.props)) {
              // Add prop
              elem.setAttribute(prop, newNode.props[prop]);
          }
          else if (prop in newNode.props && prop in oldNode.props && newNode.props[prop] !== oldNode.props[prop]) {
              // Update prop
              elem.setAttribute(prop, newNode.props[prop]);
          }
      });
      // #endregion
      // #region Update events
      new Set([
          ...Object.keys(oldNode.events),
          ...Object.keys(newNode.events),
      ]).forEach((event) => {
          if (event in oldNode.events && !(event in newNode.events)) {
              // Remove all listeners
              oldNode.events[event].forEach((cb) => {
                  elem.removeEventListener(event, cb);
              });
          }
          else if (event in newNode.events && !(event in oldNode.events)) {
              // Add new listeners
              newNode.events[event].forEach((cb) => {
                  elem.addEventListener(event, cb);
              });
          }
          else if (event in newNode.events && event in oldNode.events) {
              // Some listeners might have changed
              for (let i = 0; i < Math.max(oldNode.events[event].length, newNode.events[event].length); i++) {
                  const oldHandler = oldNode.events[event][i];
                  const newHandler = newNode.events[event][i];
                  // Naively compare function signatures between oldNode and newNode to limit nr of assignments each render
                  if (oldHandler.toString() !== newHandler.toString()) {
                      elem.removeEventListener(event, oldHandler);
                      elem.addEventListener(event, newHandler);
                  }
              }
          }
      });
      // #endregion
      // #region Update children
      for (let i = 0; i < newNode.children.length; i++) {
          if (i < oldNode.children.length) {
              // Updated elements compared to previous nodeTree
              updateNode(newNode.children[i], oldNode.children[i], elem.children.item(i));
          }
          else {
              // Create new elements
              elem.appendChild(renderNode_1.renderNode(newNode.children[i]));
          }
      }
      const firstInvalidIndex = newNode.children.length;
      const elementsToRemove = elem.children.length - firstInvalidIndex;
      for (let i = 0; i < elementsToRemove; i++) {
          // Remove extra elements
          elem.children.item(firstInvalidIndex).remove();
      }
      // #endregion
  }
  exports.updateNode = updateNode;
  });

  unwrapExports(updateNode_1);
  var updateNode_2 = updateNode_1.updateNode;

  var renderer = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });




  function Renderer(config) {
      let initialRender = true;
      let oldRootNode = null;
      const customOperations = {};
      return {
          render(rootBuilder) {
              const [rootNode, styles] = builder.buildNode(config.rootElement.tagName.toLowerCase(), rootBuilder, customOperations);
              // Append styles if needed
              if (Object.keys(styles).length > 0) {
                  rootNode.children.push(builder.newVNode({
                      tag: 'style',
                      text: renderStyles.renderStyle(styles),
                      props: {
                          type: 'text/css',
                      },
                  }));
              }
              // Render / Update HTML
              if (initialRender) {
                  initialRender = false;
                  const newRoot = renderNode_1.renderNode(rootNode);
                  config.rootElement.replaceWith(newRoot);
                  config.rootElement = newRoot;
              }
              else {
                  updateNode_1.updateNode(rootNode, oldRootNode, config.rootElement);
              }
              // Update refs for next render
              oldRootNode = rootNode;
          },
          extend(operationName, constructor) {
              customOperations[operationName] = constructor;
          },
      };
  }
  exports.Renderer = Renderer;
  });

  unwrapExports(renderer);
  var renderer_1 = renderer.Renderer;

  var events = createCommonjsModule(function (module, exports) {
  // Events: https://www.w3schools.com/tags/ref_eventattributes.asp
  Object.defineProperty(exports, "__esModule", { value: true });
  // tslint:disable-next-line no-namespace
  var Events;
  (function (Events) {
      let Mouse;
      (function (Mouse) {
          Mouse["Click"] = "click";
          Mouse["DoubleClick"] = "dblclick";
          Mouse["Down"] = "mousedown";
          Mouse["Up"] = "mouseup";
          Mouse["Move"] = "mousemove";
          Mouse["Out"] = "mouseout";
          Mouse["Over"] = "mouseover";
          Mouse["Wheel"] = "wheel";
      })(Mouse = Events.Mouse || (Events.Mouse = {}));
      let Keyboard;
      (function (Keyboard) {
          Keyboard["Down"] = "keydown";
          Keyboard["Up"] = "keyup";
          Keyboard["Press"] = "keypress";
      })(Keyboard = Events.Keyboard || (Events.Keyboard = {}));
      let Drag;
      (function (Drag) {
          Drag["Drag"] = "drag";
          Drag["End"] = "dragend";
          Drag["Enter"] = "dragenter";
          Drag["Leave"] = "dragleave";
          Drag["Over"] = "dragover";
          Drag["Start"] = "dragstart";
          Drag["Drop"] = "drop";
          Drag["Scroll"] = "scroll";
      })(Drag = Events.Drag || (Events.Drag = {}));
      let Clipboard;
      (function (Clipboard) {
          Clipboard["Copy"] = "copy";
          Clipboard["Cut"] = "cut";
          Clipboard["Paste"] = "paste";
      })(Clipboard = Events.Clipboard || (Events.Clipboard = {}));
  })(Events = exports.Events || (exports.Events = {}));
  });

  unwrapExports(events);
  var events_1 = events.Events;

  var brynja = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });


  exports.Events = events.Events;
  var renderer_2 = renderer;
  exports.Renderer = renderer_2.Renderer;
  const defaultRenderer = (() => {
      let default_renderer = null;
      return () => {
          if (default_renderer === null) {
              // This makes sure the dom is ready when the Renderer is constructed.
              default_renderer = renderer.Renderer({
                  rootElement: document.getElementById('root'),
              });
          }
          return default_renderer;
      };
  })();
  // Because the tests run asynchronous its typically unreliable to test the extend functionality of the default renderer.
  /* istanbul ignore next */
  exports.extend = (operationName, constructor) => defaultRenderer().extend(operationName, constructor);
  exports.render = (rootBuilder) => defaultRenderer().render(rootBuilder);
  });

  unwrapExports(brynja);
  var brynja_1 = brynja.Events;
  var brynja_2 = brynja.Renderer;
  var brynja_3 = brynja.extend;
  var brynja_4 = brynja.render;

  const updateCube = (state, onTransitioned = () => { }) => {
      brynja_4(_ => _
          .prop('style', `
      --rotationX: ${state.rotate.x}deg;
      --rotationY: ${state.rotate.y}deg;
    `)
          .id('wrapper')
          .child('div', _ => _
          .class(['cube'])
          .when(state.doAnimation, _ => _
          .class(['animate']))
          .on('transitionend', onTransitioned)
          .child('div', _ => _
          .id('front')
          .text(state.content.FRONT))
          .child('div', _ => _
          .id('left')
          .text(state.content.LEFT))
          .child('div', _ => _
          .id('right')
          .text(state.content.RIGHT))
          .child('div', _ => _
          .id('top')
          .text(state.content.UP))
          .child('div', _ => _
          .id('bottom')
          .text(state.content.DOWN))));
  };

  // Stateless machine definition
  const roomMachine = Machine({
      id: "rooms",
      initial: "home",
      context: {
          doAnimation: true,
          content: {
              FRONT: 'home',
              LEFT: '',
              RIGHT: '',
              UP: '',
              DOWN: '',
          },
          rotate: {
              x: 0,
              y: 0,
          },
          resetInputStop: () => { },
      },
      states: {
          home: {
              entry: ["loadRoom"],
              on: {
                  UP: {
                      target: "attic",
                      actions: ["transitionUp"]
                  },
                  LEFT: {
                      target: "porch",
                      actions: ["transitionLeft"]
                  },
                  RIGHT: {
                      target: "yard",
                      actions: ["transitionRight"]
                  },
                  DOWN: {
                      target: "basement",
                      actions: ["transitionDown"]
                  }
              }
          },
          basement: {
              entry: ["loadRoom"],
              on: {
                  UP: {
                      target: "home",
                      actions: ["transitionUp"]
                  },
                  DOWN: {
                      target: "secret laboratory",
                      actions: ["transitionDown"]
                  }
              }
          },
          "secret laboratory": {
              entry: ["loadRoom"],
              on: {
                  UP: {
                      target: "basement",
                      actions: ["transitionUp"]
                  },
                  LEFT: {
                      target: "room of vials",
                      actions: ["transitionLeft"]
                  },
                  RIGHT: {
                      target: "prison cells",
                      actions: ["transitionRight"]
                  }
              }
          },
          "room of vials": {
              entry: ["loadRoom"],
              on: {
                  RIGHT: {
                      target: "secret laboratory",
                      actions: ["transitionRight"]
                  }
              }
          },
          "prison cells": {
              entry: ["loadRoom"],
              on: {
                  LEFT: {
                      target: "secret laboratory",
                      actions: ["transitionLeft"]
                  }
              }
          },
          porch: {
              entry: ["loadRoom"],
              on: {
                  RIGHT: {
                      target: "home",
                      actions: ["transitionRight"]
                  },
                  LEFT: {
                      target: "yard",
                      actions: ["transitionLeft"]
                  }
              }
          },
          yard: {
              entry: ["loadRoom"],
              on: {
                  LEFT: {
                      target: "home",
                      actions: ["transitionLeft"]
                  },
                  RIGHT: {
                      target: "porch",
                      actions: ["transitionRight"]
                  }
              }
          },
          attic: {
              entry: ["loadRoom"],
              on: {
                  UP: {
                      target: "roof",
                      actions: ["transitionUp"]
                  },
                  DOWN: {
                      target: "home",
                      actions: ["transitionDown"]
                  }
              }
          },
          roof: {
              entry: ["loadRoom"],
              on: {
                  DOWN: {
                      target: "attic",
                      actions: ["transitionDown"]
                  }
              }
          }
      }
  }, {
      actions: {
          loadRoom: (context, event, meta) => {
              if (event.type === "xstate.init") {
                  updateCube(context);
                  return;
              }
              const target = event.type;
              context.content[target] = meta.state.value.toString();
              updateCube(context, () => {
                  context.doAnimation = false;
                  updateCube(context);
                  context.content.FRONT = context.content[target];
                  context.rotate.x = 0;
                  context.rotate.y = 0;
                  updateCube(context);
                  setTimeout(() => {
                      context.doAnimation = true;
                      context.content[target] = '';
                      updateCube(context);
                      context.resetInputStop();
                  }, 1);
              });
          },
          transitionUp: (context, event, meta) => {
              context.rotate.x = -90;
              updateCube(context);
          },
          transitionDown: (context, event, meta) => {
              context.rotate.x = 90;
              updateCube(context);
          },
          transitionLeft: (context, event, meta) => {
              context.rotate.y = 90;
              updateCube(context);
          },
          transitionRight: (context, event, meta) => {
              context.rotate.y = -90;
              updateCube(context);
          }
      }
  });

  let swallowInput = false;
  const roomService = interpret(roomMachine
      .withContext({
      doAnimation: true,
      content: {
          FRONT: 'home',
          LEFT: '',
          RIGHT: '',
          UP: '',
          DOWN: '',
      },
      rotate: {
          x: 0,
          y: 0,
      },
      resetInputStop: () => {
          swallowInput = false;
      },
  })).onTransition(state => {
      if (state.changed) {
          swallowInput = true;
      }
  })
      .start();
  const hammer$1 = new hammer(document.body);
  hammer$1.get('swipe').set({
      direction: hammer.DIRECTION_ALL
  });
  // listen to events...
  hammer$1.on("swipeup", (ev) => {
      if (ev.pointerType !== 'touch') {
          return;
      }
      if (swallowInput) {
          return;
      }
      roomService.send('DOWN');
  });
  hammer$1.on("swipedown", (ev) => {
      if (ev.pointerType !== 'touch') {
          return;
      }
      if (swallowInput) {
          return;
      }
      roomService.send('UP');
  });
  hammer$1.on("swipeleft", (ev) => {
      if (ev.pointerType !== 'touch') {
          return;
      }
      if (swallowInput) {
          return;
      }
      roomService.send('RIGHT');
  });
  hammer$1.on("swiperight", (ev) => {
      if (ev.pointerType !== 'touch') {
          return;
      }
      if (swallowInput) {
          return;
      }
      roomService.send('LEFT');
  });
  document.addEventListener("keydown", ev => {
      if (swallowInput) {
          return;
      }
      const key = ev.code;
      if (key === "ArrowUp") {
          roomService.send("UP");
      }
      else if (key === "ArrowDown") {
          roomService.send("DOWN");
      }
      else if (key === "ArrowLeft") {
          roomService.send("LEFT");
      }
      else if (key === "ArrowRight") {
          roomService.send("RIGHT");
      }
  });

}());

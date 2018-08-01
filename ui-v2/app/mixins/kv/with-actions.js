import Mixin from '@ember/object/mixin';
import { get, set } from '@ember/object';
import WithFeedback from 'consul-ui/mixins/with-feedback';

const transitionToList = function(key = '/', transitionTo) {
  if (key === '/') {
    return transitionTo('dc.kv.index');
  } else {
    return transitionTo('dc.kv.folder', key);
  }
};

export default Mixin.create(WithFeedback, {
  actions: {
    create: function(item, parent) {
      get(this, 'feedback').execute(() => {
        return get(this, 'repo')
          .persist(item)
          .then(item => {
            return transitionToList(get(parent, 'Key'), this.transitionTo.bind(this));
          });
      }, 'create');
    },
    update: function(item, parent) {
      get(this, 'feedback').execute(() => {
        return get(this, 'repo')
          .persist(item)
          .then(() => {
            return transitionToList(get(parent, 'Key'), this.transitionTo.bind(this));
          });
      }, 'update');
    },
    delete: function(item, parent) {
      get(this, 'feedback').execute(() => {
        return get(this, 'repo')
          .remove(item)
          .then(() => {
            switch (this.routeName) {
              case 'dc.kv.folder':
              case 'dc.kv.index':
                return this.refresh();
              default:
                return transitionToList(get(parent, 'Key'), this.transitionTo.bind(this));
            }
          });
      }, 'delete');
    },
    cancel: function(item, parent) {
      return transitionToList(get(parent, 'Key'), this.transitionTo.bind(this));
    },
    invalidateSession: function(item) {
      const controller = this.controller;
      const repo = get(this, 'sessionRepo');
      get(this, 'feedback').execute(() => {
        return repo.remove(item).then(() => {
          const item = get(controller, 'item');
          set(item, 'Session', null);
          delete item.Session;
          set(controller, 'session', null);
        });
      }, 'delete');
    },
  },
});

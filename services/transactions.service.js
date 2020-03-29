const DbService = require("moleculer-db");
const MongoDBAdapter = require("moleculer-db-adapter-mongo");
const ApiGateway = require("moleculer-web");
const { Errors } = require("moleculer");
const { v4 } = require('uuid');

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

module.exports = {
	name: "transactions",
	mixins: [DbService, ApiGateway],
	adapter: new MongoDBAdapter(process.env.DATABASE),
	collection: "transactions",

	/**
	 * Settings
	 */
	settings: {
		routes: [{
			aliases: {
				"POST transactions": "transactions.create",
			}
		}]
	},

	/**
	 * Dependencies
	 */
	dependencies: [
		"paypal"
	],

	/**
	 * Actions
	 */
	actions: {

		/**
		 * Say a 'Hello' action.
		 *
		 * @returns
		 */
		create: {
			params: {
				cart: { type: 'object' },
				payType: { type: 'string' },
				address: { type: 'object' },
				user: { type: 'object' }
			},
			handler(ctx) {
				return this.create(
					ctx.params.cart,
					ctx.params.payType,
					ctx.params.address,
					ctx.params.user
				);
			}
		},
	},

	/**
	 * Events
	 */
	events: {

	},

	/**
	 * Methods
	 */
	methods: {
		async create(cart, payType, address, user) {
			const summaryCart = await this.broker.call('carts.getSummary', { id: cart.id });
			const transaction = {
				id: v4(),
				cart: summaryCart,
				payType,
				address,
				user,
				total: summaryCart.total,
				date: new Date().toISOString()
			};

			transaction.status = await this.broker.call('paypal.validate', { transaction })

			return this.adapter.insert(transaction);
		}
	},

	/**
	 * Service created lifecycle event handler
	 */
	created() {

	},

	/**
	 * Service started lifecycle event handler
	 */
	async started() {

	},

	/**
	 * Service stopped lifecycle event handler
	 */
	async stopped() {

	}
};

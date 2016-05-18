/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
*/

var SettingsPage = function (game, options) {
	Phaser.State.call(this);

	this.game = game;
	this.xml = null;
	this.parser = null;
};

SettingsPage.prototype = Object.create(Phaser.State.prototype);
SettingsPage.prototype.constructor = SettingsPage;

Phaser.Utils.extend(SettingsPage.prototype, {
	init: function (options) {
		var defaults = {
			backgroundColor: 0x282828,

			xml_key: "",

			img_row: "bgSettings",
			img_switchOn: "switchOn",
			img_switchOff: "switchOff",
			img_transparent: "transp",

			font: "DroidSans_100",

			width: -1,
			height: -1,
			additionalHeight: 0,

			link_tint: 0x007bf2,

			// labels
			lbl_title: "Settings",
			lbl_close: "Done",

			// numbers
			fontSize: -1,
			header: {
				width: -1,
				height: -1
			},
			text: {
				x: -1,
				y: -1
			},
			done: {
				x: -1,
				y: -1
			},
			row: {
				x: -1,
				y: -1,
				width: -1,
				height: -1,
				text: {
					x: -1
				}
			}
		};

		this.options = Phaser.Utils.extend({}, defaults, options);

		if (this.options.xml_key === null || this.options.xml_key === undefined || this.options.xml_key === "")
			throw new Error("SettingsPage xml file not set.");

		if (this.options.width <= 0) {
			this.options.width = window.innerWidth * window.devicePixelRatio;
		}
		if (this.options.height <= 0) {
			this.options.height = window.innerHeight * window.devicePixelRatio;
			if (this.options.additionalHeight > 0)
				this.options.height = this.options.height - this.options.additionalHeight;
		}

		var commonHeight = .1 * this.options.height;
		if (this.options.fontSize <= 0) {
			this.options.fontSize = .5 * commonHeight;
		}
		if (this.options.header.width <= 0) {
			this.options.header.width = this.options.width;
		}
		if (this.options.header.height <= 0) {
			this.options.header.height = commonHeight;
		}
		if (this.options.text.x <= 0) {
			this.options.text.x = this.options.width / 2;
		}
		if (this.options.text.y <= 0) {
			this.options.text.y = commonHeight / 2
		}
		if (this.options.done.x <= 0) {
			this.options.done.x = this.options.width;
		}
		if (this.options.done.y <= 0) {
			this.options.done.y = commonHeight / 2;
		}
		if (this.options.row.x < 0) {
			this.options.row.x = 0;
		}
		if (this.options.row.y <= 0) {
			this.options.row.y = commonHeight;
		}
		if (this.options.row.width <= 0) {
			this.options.row.width = this.options.width;
		}
		if (this.options.row.height <= 0) {
			this.options.row.height = commonHeight;
		}
		if (this.options.row.text.x <= 0) {
			this.options.row.text.x = 20;
		}
	},

	create: function () {
		this.game.stage.backgroundColor = this.options.backgroundColor;

		this.xml = this.game.cache.getText(this.options.xml_key);
		this.parser = new DOMParser("xml");
		this.xml = this.parser.parseFromString(this.xml, "application/xml");

		var headerBar = this.game.add.tileSprite(0, 0, this.options.header.width, this.options.header.height, this.options.img_row);
		var settingsText = this.createLabel(this.options.text.x, this.options.text.y, this.options.lbl_title, this.options.fontSize);
		var _x = this.options.done.x;
		var doneText = this.createLabel(function (o) {
			return _x - o.width - 20
		}, this.options.done.y, this.options.lbl_close, this.options.fontSize, true);
		var doneAction = null;
		if (this.xml.querySelector("done").hasAttribute("action")) doneAction = this.xml.querySelector("done").attributes["action"].value;
		if (doneAction == null) {
			doneAction = xml.querySelector("done").querySelector("action");
			if (doneAction !== null) doneAction = doneAction.textContent;
		}
		var doneButton = this.createButton(doneText.x, doneText.y, doneText.width, this.options.header.height, this.options.img_transparent, doneAction, this);

		var rows = this.xml.querySelectorAll("row");
		var sub = 0;
		for (var i = 0; i < rows.length; i++) {
			var row = rows[i];
			var multiplier = (i + 1 - sub) * 1.5;
			var showRow = true;

			var rule = null;
			if (row.hasAttribute("rule")) rule = row.attributes["rule"].value;
			if (rule == null) {
				rule = row.querySelector("rule");
				if (rule !== null) rule = rule.textContent;
			}
			if (rule !== null) {
				rule = rule.trim();
				if (rule.indexOf("return") === 0)
					showRow = new Function(rule)();
				else
					showRow = new Function("return " + rule)();
			}

			if (!showRow) sub++;

			if (showRow) {
				var type = row.attributes["type"].value;

				var rowBar = this.game.add.tileSprite(
					this.options.row.x,
					this.options.row.y * multiplier,
					this.options.row.width,
					this.options.header.height,
					this.options.img_row);
				var rowText = this.createLabel(
					this.options.row.text.x,
					(this.options.row.y * multiplier) + (this.options.row.y / 2),
					row.attributes["text"].value,
					this.options.fontSize,
					type === "link");

				var action = null;
				if (row.hasAttribute("action")) action = row.attributes["action"].value;
				if (action == null) {
					action = row.querySelector("action");
					if (action !== null) action = action.textContent;
				}

				var _options = this.options;
				switch (type) {
					case "bool":
						var rowSwitch = this.createSwitch(
							function (o) { return _options.width - o.width - 20; },
							(this.options.row.y * multiplier) + (this.options.row.y / 2),
							row.attributes["property"].value,
							action,
							this);
						break;

					case "link":
						var rowButton = this.createButton(
							this.options.row.text.x,
							(this.options.row.y * multiplier) + (this.options.row.y / 2),
							rowText.width,
							this.options.header.height,
							this.options.img_transparent,
							action,
							this);
						break;
				}
			}
		}
	},

	shutdown: function () {
		delete this.parser;
		delete this.xml;
		delete this.options;
	},

	createSwitch: function (x, y, property, click, context) {
		var vX = 0, vY = 0;
		if (typeof x !== "function") {
			vX = x;
		}
		if (typeof y !== "function") {
			vY = y;
		}
		var vSwitch = this.game.add.button(vX, vY,
			new Function("return " + property)() ? this.options.img_switchOn : this.options.img_switchOff,
			function (o) {
				new Function(property + " = !" + property)();
				if (new Function("return " + property)()) {
					o.loadTexture(this.options.img_switchOn);
				} else {
					o.loadTexture(this.options.img_switchOff);
				}
				if (click !== null && click !== undefined && typeof click === "function") {
					click(o);
				}
				if (click !== null && click !== undefined && typeof click === "string") {
					new Function("o", click)(o);
				}
			}, context);
		if (typeof x === "function") {
			vSwitch.x = x(vSwitch);
		}
		if (typeof y === "function") {
			vSwitch.y = y(vSwitch);
		}
		vSwitch.anchor.setTo(0, 0.5);

		return vSwitch;
	},

	createButton: function (x, y, w, h, img, click, context) {
		var vX = 0, vY = 0;
		if (typeof x !== "function") {
			vX = x;
		}
		if (typeof y !== "function") {
			vY = y;
		}
		var vButton = this.game.add.button(vX, vY, img, function (o) {
			if (click !== null && click !== undefined && typeof click === "function") {
				click(o);
			}
			if (click !== null && click !== undefined && typeof click === "string") {
				new Function("o", click)(o);
			}
		}, context);
		var vW = 0, vH = 0;
		if (typeof w !== "function") {
			vW = w;
		}
		if (typeof h !== "function") {
			vH = h;
		}
		if (typeof w === "function") {
			vW = w(vButton);
		}
		if (typeof h === "function") {
			vH = h(vButton);
		}
		vButton.width = vW;
		vButton.height = vH;
		if (typeof x === "function") {
			vText.x = x(vText);
		}
		if (typeof y === "function") {
			vText.y = y(vText);
		}
		vButton.anchor.setTo(0, 0.5);

		return vButton;
	},

	createLabel: function (x, y, text, fontSize, tint) {
		var vX = 0, vY = 0;
		if (typeof x !== "function") {
			vX = x;
		}
		if (typeof y !== "function") {
			vY = y;
		}
		var vText = this.game.add.bitmapText(vX, vY, this.options.font, text, fontSize);
		if (typeof x === "function") {
			vText.x = x(vText);
		}
		if (typeof y === "function") {
			vText.y = y(vText);
		}
		if (tint !== undefined) {
			if (tint) {
				vText.tint = this.options.tint;
			}
		}
		vText.anchor.setTo(0, 0.5);

		return vText;
	}
});

module.exports = SettingsPage;

/*******************************************************************************
 * OpenEMS - Open Source Energy Management System
 * Copyright (c) 2016, 2017 FENECON GmbH and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 * Contributors:
 *   FENECON GmbH - initial API and implementation and initial documentation
 *******************************************************************************/
package io.openems.impl.controller.symmetric.limit;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.openems.api.channel.ConfigChannel;
import io.openems.api.channel.thingstate.ThingStateChannels;
import io.openems.api.controller.Controller;
import io.openems.api.doc.ChannelInfo;
import io.openems.api.doc.ThingInfo;
import io.openems.api.exception.InvalidValueException;
import io.openems.core.utilities.power.symmetric.PowerException;

@ThingInfo(title = "Max active power (Symmetric)", description = "Charges or discharges the battery with a predefined, fixed power. For symmetric Ess.")
public class PSmallerEqualController extends Controller {

	private final Logger log = LoggerFactory.getLogger(PSmallerEqualController.class);

	private ThingStateChannels thingState = new ThingStateChannels(this);
	/*
	 * Constructors
	 */
	public PSmallerEqualController() {
		super();
	}

	public PSmallerEqualController(String thingId) {
		super(thingId);
	}

	/*
	 * Config
	 */
	@ChannelInfo(title = "Ess", description = "Sets the Ess devices.", type = Ess.class, isArray = true)
	public ConfigChannel<List<Ess>> esss = new ConfigChannel<List<Ess>>("esss", this);

	@ChannelInfo(title = "ActivePower", description = "The max active power allowed for each Ess.", type = Long.class)
	public ConfigChannel<Long> p = new ConfigChannel<Long>("p", this);

	/*
	 * Methods
	 */
	@Override
	public void run() {
		try {
			for (Ess ess : esss.value()) {
				ess.pSmallerEqualLimit.setP(p.valueOptional().orElse(null));
				ess.power.applyLimitation(ess.pSmallerEqualLimit);
			}
		} catch (InvalidValueException e) {
			log.error("No ess found.", e);
		} catch (PowerException e) {
			log.error("Failed to set Power!",e);
		}
	}

	@Override
	public ThingStateChannels getStateChannel() {
		return thingState;
	}

}


package io.openems.edge.controller.io.heatingelement;

public enum WorkMode {
	/**
	 * Time (= run at least Minimum Time).
	 */
	TIME,
	/**
	 * None (= only run on excess power, no guaranteed Minimum Time).
	 */
	NONE;
}
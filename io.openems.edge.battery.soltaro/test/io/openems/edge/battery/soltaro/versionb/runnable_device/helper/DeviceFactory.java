package io.openems.edge.battery.soltaro.versionb.runnable_device.helper;

import io.openems.common.exceptions.OpenemsException;
import io.openems.edge.battery.soltaro.single.versionb_runnable_device.devctrl.RunnableDevice;

public class DeviceFactory {

	private DeviceFactory() {}
	
	public static RunnableDevice getRunningDevice() {
		return new RunnableDevice() {
			@Override public void stop() throws OpenemsException {}
			@Override public void start() throws OpenemsException {}
			@Override public boolean isStopped() { return false; }
			@Override public boolean isRunning() { return true; }
			@Override public boolean isError() { return false; }
		};
	}
	
	public static RunnableDevice getStoppedDevice() {
		return new RunnableDevice() {
			@Override public void stop() throws OpenemsException {}
			@Override public void start() throws OpenemsException {}
			@Override public boolean isStopped() { return true; }
			@Override public boolean isRunning() { return false; }
			@Override public boolean isError() { return false; }
		};
	}
	
	public static RunnableDevice getErrorDevice() {
		return new RunnableDevice() {
			@Override public void stop() throws OpenemsException {}
			@Override public void start() throws OpenemsException {}
			@Override public boolean isStopped() { return false; }
			@Override public boolean isRunning() { return false; }
			@Override public boolean isError() { return true; }
		};
	}
	
	public static RunnableDevice getUndefinedDevice() {
		return new RunnableDevice() {
			@Override public void stop() throws OpenemsException {}
			@Override public void start() throws OpenemsException {}
			@Override public boolean isStopped() { return false; }
			@Override public boolean isRunning() { return false; }
			@Override public boolean isError() { return false; }
		};
	}

	public static CommandDevice getCommandDevice() {
		return new CommandDevice();
	}
	
	
}
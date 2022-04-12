using System;
using System.Collections.Generic;
using System.Text;
using MediaBrowser.Model.Plugins;

namespace DeviceEditor.Configuration
{
    public class PluginConfiguration : BasePluginConfiguration
    {
        public int threshold { get; set; }
        public bool scheduledTaskEnabled { get; set; } = false;
    }
}

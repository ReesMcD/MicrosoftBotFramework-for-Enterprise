using System;
using System.Threading.Tasks;
using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Connector;

namespace EricCortana.Dialogs
{
    [Serializable]
    public class RootDialog : IDialog<object>
    {
        public Task StartAsync(IDialogContext context)
        {
            context.Wait(MessageReceivedAsync);

            return Task.CompletedTask;
        }

        private async Task MessageReceivedAsync(IDialogContext context, IAwaitable<object> result)
        {
            var activity = await result as Activity;

            // calculate something for us to return
            int length = (activity.Text ?? string.Empty).Length;

            // return our reply to the user
            await context.PostAsync($"You sent {activity.Text} which was {length} characters");

            await this.SendWelcomeMessageAsync(context);

            context.Wait(MessageReceivedAsync);
        }

        private async Task SendWelcomeMessageAsync(IDialogContext context) {
            string current_time = DateTime.Now.ToString("h:mm tt");
            await context.PostAsync("Hi Jun, it's " + current_time + ". What would you like to do?", current_time);
        }
    }
}
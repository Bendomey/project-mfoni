using main.DTOs;
using main.Models;

namespace main.Domains.WaitlistMngmt
{
    public interface IWaitlistService
    {
        public Task<Waitlist> SaveWaitlistDetails(CreateWaitlistInput entry);
    }
}

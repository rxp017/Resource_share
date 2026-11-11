import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
const mocks = vi.hoisted(() => ({ listing: vi.fn(), listings: vi.fn(), messages: vi.fn(), send: vi.fn(), conversations: vi.fn(), create: vi.fn() }));
vi.mock('../src/modules/auth', () => ({ useAuth: () => ({user: {id: 'me'}}) }));
vi.mock('../src/modules/chat/api', () => ({ fetchMessages: mocks.messages, sendMessage: mocks.send, fetchConversations: mocks.conversations }));
vi.mock('../src/modules/listings/api', () => ({fetchListingById: mocks.listing, fetchPublishedListings: mocks.listings}));
vi.mock('../src/modules/exchanges/api', () => ({ createExchangeRequest: mocks.create }));
import { InboxPage } from '../src/modules/chat/InboxPage';
import { RequestExchangePage } from '../src/modules/exchanges/RequestExchangePage';
import { ExplorePage } from '../src/modules/listings/ExplorePage';
const rental = {id:'live-rental',owner_id:'owner',title:'Lab kit',price_paise:2000,deposit_paise:5000,mode:'rental',category:'electronics',condition:'good',version:1};
function inbox() { return render(<MemoryRouter initialEntries={['/inbox/a']}><Routes><Route path="/inbox/:id" element={<InboxPage/>}/></Routes></MemoryRouter>); }
function request() {return render(<MemoryRouter initialEntries={['/listings/live/request']}><Routes><Route path="/listings/:id/request" element={<RequestExchangePage/>}/></Routes></MemoryRouter>);}
beforeEach(() => {
  mocks.messages.mockResolvedValue([]);
  mocks.send.mockResolvedValue({id:'m',content:'sent',sender_id:'me',created_at:new Date().toISOString()});
  mocks.conversations.mockResolvedValue([
    {transaction_id:'a',listing_title:'Item Alpha',counterpart_name:'Person Alpha',status:'requested'},
    {transaction_id:'b',listing_title:'Item Beta',counterpart_name:'Person Beta',status:'requested'}
  ]);
  mocks.listing.mockResolvedValue(rental);
  mocks.listings.mockResolvedValue([{...rental,id:'sale',mode:'sale',title:'Book',price_paise:25000},{...rental,title:'Kit'}]);
  HTMLElement.prototype.scrollTo = vi.fn();
});
afterEach(() => {cleanup();vi.clearAllMocks();});
describe('audit regression',()=>{
 it('does not carry drafts into another recipient',async()=>{
  inbox(); await screen.findByText('Item Beta');
  fireEvent.change(screen.getByPlaceholderText('Type message to coordinate...'),{target:{value:'private Alpha draft'}});
  fireEvent.click(screen.getByRole('button',{name:/Item Beta/}));
  await waitFor(()=>expect((screen.getByPlaceholderText('Type message to coordinate...') as HTMLInputElement).value).toBe(''));
  expect((screen.getByText('Send →') as HTMLButtonElement).disabled).toBe(true);
  expect(mocks.send).not.toHaveBeenCalled();
 });
 it('opens conversations using Enter and Space',async()=>{
  inbox(); const beta=await screen.findByRole('button',{name:/Item Beta/});
  expect(beta.tabIndex).toBe(0);fireEvent.keyDown(beta,{key:'Enter'});
  await waitFor(()=>expect(beta.getAttribute('aria-pressed')).toBe('true'));
  const alpha=screen.getByRole('button',{name:/Item Alpha/});fireEvent.keyDown(alpha,{key:' '});
  await waitFor(()=>expect(alpha.getAttribute('aria-pressed')).toBe('true'));
 });
 it('keeps old in-flight send completion out of the new thread',async()=>{
  let resolveSend: (v:unknown)=>void=()=>{};
  mocks.send.mockImplementationOnce(()=>new Promise(resolve=>{resolveSend=resolve;}));
  inbox();await screen.findByText('Item Beta');
  fireEvent.change(screen.getByPlaceholderText('Type message to coordinate...'),{target:{value:'old draft'}});
  fireEvent.click(screen.getByText('Send →'));
  fireEvent.click(screen.getByRole('button',{name:/Item Beta/}));
  resolveSend({id:'old',content:'old draft',sender_id:'me',created_at:new Date().toISOString()});
  await waitFor(()=>expect(screen.queryByText('old draft')).toBeNull());
 });
 it('shows fee, deposit and their combined amount without changing request terms',async()=>{
  request();await screen.findByText('Refundable security deposit');
  expect(screen.getByText('₹50.00')).toBeTruthy();expect(screen.getByText('₹70.00')).toBeTruthy();expect(mocks.create).not.toHaveBeenCalled();
 });
 it('blocks direct demo request URLs',async()=>{
  mocks.listing.mockResolvedValue({...rental,id:'seed-demo'});request();
  await screen.findByText('Demo listing only');expect(screen.queryByText('Confirm and Send Request')).toBeNull();expect(mocks.create).not.toHaveBeenCalled();
 });
 it('applies Max Sale to sale rows even in All mode',async()=>{
  render(<MemoryRouter><ExplorePage/></MemoryRouter>);await screen.findByText('Book');fireEvent.click(screen.getByText('Filters'));
  fireEvent.change(screen.getByLabelText('Max Sale (₹):'),{target:{value:'100'}});
  await waitFor(()=>expect(screen.queryByText('Book')).toBeNull());expect(screen.getByText('Kit')).toBeTruthy();
 });
 it('treats zero maximum daily price as a constraint',async()=>{
  render(<MemoryRouter><ExplorePage/></MemoryRouter>);await screen.findByText('Kit');fireEvent.click(screen.getByText('Filters'));
  fireEvent.change(screen.getByLabelText('Max Daily (₹):'),{target:{value:'0'}});
  await waitFor(()=>expect(screen.queryByText('Kit')).toBeNull());expect(screen.getByText('Book')).toBeTruthy();
 });
});

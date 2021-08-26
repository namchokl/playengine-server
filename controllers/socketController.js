import { Server } from 'socket.io';

const socketInitialize = (expressServer) => {
	const io = new Server(expressServer, {
		cors: {
			origin: '*',
			methods: '*',
		},
	});

	const users = [];
	const namespaces = ['Game-1'];
	const nsRoomsMap = new Map();

	io.on('connection', (socket) => {
		console.log(`${socket.id} is connecting....`);

		// for(let [id, socket] of io.of("/").sockets) {
		//   console.log(socket.id);
		// }

		users.push(socket.id);

		socket.emit('msg', {
			msg: 'welcome to socket.io..',
			users: users,
		});

		socket.on('disconnect', (reason) => {
			users.splice(users.indexOf(socket.id));
			console.log(`${socket.id} - disconnect.`);
			console.log(reason);
		});
	});

	namespaces.forEach((ns) => {
		nsRoomsMap.set(ns, new Map());
		initNamespace(ns, io, nsRoomsMap);
	});
};

async function joinRoom(socket, room, io, ns) {
	socket.join(room.name);
  room.count++;
	// const ids = await io.of(ns).in(room.name).fetchSockets();

	const ids = await io.of(ns).in(room.name).allSockets();

	// console.log(ids);

	// sockets.forEach((id) => {
	// 	console.log(id);
	// });

	// const userCount = io.of(ns).sockets.size;

	io.of(ns).in(room.name).emit('roomData', {
		userCount: ids.size,
		// userCount: room.count,
	});
}

function initNamespace(ns, io, nsRoomsMap) {
	io.of(ns).on('connection', (socket) => {
		console.log(`${socket.id} joined [${ns}].`);
    let nsRooms = nsRoomsMap.get(ns);
    socket.emit('roomList', Array.from(nsRooms.keys()));

    // let cnt = 0;
    // setInterval(()=>{
    //   cnt++;
    //   socket.emit('roomList', {cnt: cnt});
    // }, 500);

		// Construct Rooms Data for this ns.

		socket.on('make-room', async (roomData) => {
			let nsRooms = nsRoomsMap.get(ns);
			const roomName = roomData.name;

			if (!nsRooms.has(roomName)) {
				nsRooms.set(roomName, {
					name: roomName,
					count: 0,
				});
			}

			const room = nsRooms.get(roomName);
			joinRoom(socket, room, io, ns);
		});
	});
}

export default socketInitialize;
